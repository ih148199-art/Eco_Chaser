// functions/api/_middleware.js
// 이 파일은 /api/* 경로의 모든 요청을 가로챕니다.

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

// 1. CORS Preflight 요청 처리 (OPTIONS 메서드)
export async function onRequestOptions({ next }) {
    // 모든 OPTIONS 요청에 대해 CORS 헤더를 반환하고 체인을 종료
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

// 2. 다른 모든 요청 (GET, POST 등) 처리
export async function onRequest({ next }) {
    // 다음 라우터 (login.js, ranking.js 등)로 요청을 전달
    const response = await next(); 
    
    // 응답에 CORS 헤더를 추가하여 반환
    response.headers.set('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin']);
    response.headers.set('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
    
    return response;
}