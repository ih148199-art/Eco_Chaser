export const onRequestPost = async (context) => {
  const { env } = context;
  try {
    const result = await env.DB.prepare('DELETE FROM game_waste_stats').run();
    const meta = result.meta || {};
    return new Response(
      JSON.stringify({ success: true, message: 'game_waste_stats 테이블이 초기화되었습니다.', meta }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message || '리셋 중 오류가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
