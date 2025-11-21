export async function onRequestGet(context) {
  const { env } = context

  try {
    const { results } = await env.DB.prepare(
      'SELECT user_id, score, locate, created_at FROM scores'
    ).all()

    const scores = results || []

    // 점수 높은 순으로 정렬 (동점 시 created_at 오름차순)
    const sorted = scores.sort((a, b) => {
      const aScore = Number(a.score) || 0
      const bScore = Number(b.score) || 0
      if (aScore !== bScore) return bScore - aScore
      return (Number(a.created_at) || 0) - (Number(b.created_at) || 0)
    })

    const top = sorted.slice(0, 10)

    // 닉네임은 users 테이블에서 조인하거나, scores에 닉네임 컬럼을 추가해도 됩니다.
    // 여기서는 users 조인 예시:
    const ranking = []
    for (const row of top) {
      const { results: users } = await env.DB.prepare(
        'SELECT nickname FROM users WHERE user_id = ?1'
      )
        .bind(row.user_id)
        .all()
      const nickname = users[0]?.nickname || 'Unknown'
      ranking.push({
        nickname,
        score: row.score,
        mistakes: 0, // mistakes 컬럼이 없으므로 일단 0
      })
    }

    return new Response(
      JSON.stringify({ success: true, ranking }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '랭킹 조회 오류: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}