export async function onRequestPost(context) {
  const { env, request } = context

  try {
    const body = await request.json()
    const { userId, score, mistakes, wrongItems, locate } = body

    if (!userId || score == null) {
      return new Response(
        JSON.stringify({ success: false, message: '필수 값이 누락되었습니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const createdAt = Date.now()

    await env.DB.prepare(
      'INSERT INTO scores (user_id, score, locate, created_at) VALUES (?1, ?2, ?3, ?4)'
    )
      .bind(Number(userId), Number(score), locate || null, createdAt)
      .run()

    return new Response(
      JSON.stringify({ success: true, message: '점수가 성공적으로 등록되었습니다.' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '점수 저장 오류: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}