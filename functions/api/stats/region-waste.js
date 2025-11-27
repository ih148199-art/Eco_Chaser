export const onRequestGet = async (context) => {
  try {
    const url = new URL(context.request.url);
    const regionId = url.searchParams.get('regionId'); // 예: 'kr_seoul', 'kr_busan', 'all' 등

    let query;
    if (regionId && regionId !== 'all') {
      // 특정 지역에 대한 쓰레기 종류별 정답/오답 집계
      query = context.env.DB.prepare(
        `SELECT
           waste_type,
           SUM(correct_count) AS total_correct,
           SUM(wrong_count)   AS total_wrong
         FROM game_waste_stats
         WHERE region_id = ?
         GROUP BY waste_type
         ORDER BY total_wrong DESC`
      ).bind(regionId);
    } else {
      // 전체(모든 지역) 기준 쓰레기 종류별 집계
      query = context.env.DB.prepare(
        `SELECT
           waste_type,
           SUM(correct_count) AS total_correct,
           SUM(wrong_count)   AS total_wrong
         FROM game_waste_stats
         GROUP BY waste_type
         ORDER BY total_wrong DESC`
      );
    }

    const { results } = await query.all();

    // 프론트에서 바로 퍼센트 막대(height %)를 그릴 수 있도록 wrongRate(0~1)를 함께 내려줌
    const processed = results.map((row) => {
      const correct = Number(row.total_correct ?? 0);
      const wrong = Number(row.total_wrong ?? 0);
      const total = correct + wrong;

      // 샘플 수가 너무 적을 때 0%/100%에 딱 붙지 않도록 약간의 사전 분포를 섞어줍니다.
      // priorWrongRate: 0.5 (절반은 틀린다고 가정), priorWeight: 3 (가상의 3회 시도)
      const priorWrongRate = 0.5;
      const priorWeight = 3;

      const smoothedWrongRate =
        total > 0
          ? (wrong + priorWrongRate * priorWeight) / (total + priorWeight)
          : 0;

      return {
        wasteType: row.waste_type || '기타',
        totalCorrect: correct,
        totalWrong: wrong,
        wrongRate: smoothedWrongRate,
      };
    });

    return new Response(JSON.stringify(processed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};