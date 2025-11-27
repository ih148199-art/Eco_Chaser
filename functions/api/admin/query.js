export const onRequestPost = async (context) => {
  try {
    const { env, request } = context;
    const body = await request.json();
    const sql = (body && body.sql && String(body.sql)) || '';

    if (!sql.trim()) {
      return new Response(JSON.stringify({ success: false, message: 'sql 문자열이 필요합니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 간단한 보호 장치: SELECT / INSERT / UPDATE / DELETE / PRAGMA 정도만 허용
    const upper = sql.trim().toUpperCase();
    const allowed = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    if (!allowed.some((kw) => upper.startsWith(kw))) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '허용되지 않은 SQL입니다. SELECT / INSERT / UPDATE / DELETE만 사용할 수 있습니다.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const statement = env.DB.prepare(sql);
    const result = await statement.all();

    const payload = {
      success: true,
      results: result.results || [],
      meta: result.meta || null,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
