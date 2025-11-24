export async function onRequestGet(context) {
  const { env } = context;

  try {
    // game_scores 테이블에서 전 사용자 게임 기록 조회
    const { results } = await env.DB.prepare(
      `SELECT
         player_name,
         score,
         COALESCE(region_name, '기타') AS region_name,
         timestamp
       FROM game_scores`
    ).all();

    const scores = results || [];

    // 점수 높은 순, 동점이면 최신 기록 우선
    const sorted = scores.sort((a, b) => {
      const aScore = Number(a.score) || 0;
      const bScore = Number(b.score) || 0;
      if (aScore !== bScore) return bScore - aScore;

      const aTime = new Date(a.timestamp).getTime() || 0;
      const bTime = new Date(b.timestamp).getTime() || 0;
      return bTime - aTime;
    });

    const top = sorted.slice(0, 10);

    // 프론트에서 기대하는 형태로 변환
    const ranking = top.map((row, idx) => ({
      rank: idx + 1,
      nickname: row.player_name || 'Unknown',
      score: Number(row.score) || 0,
      mistakes: 0, // 현재는 오답 수를 별도 저장하지 않으므로 0으로 둠
      region: row.region_name,
    }));

    return new Response(JSON.stringify({ success: true, ranking }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '랭킹 조회 오류: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}