// Cloudflare Workers Proxy Solution
// File: cloudflare-worker.js
// Deploy tại: https://workers.cloudflare.com/

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
        },
      });
    }

    try {
      const url = new URL(request.url);
      
      // Chuyển hướng tất cả requests tới Supabase Edge Functions
      const targetUrl = `https://vekrhqotmgszgsredkud.functions.supabase.co${url.pathname}`;
      
      // Forward request với tất cả headers
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // Clone response và thêm CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
        },
      });

      return newResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Proxy error', details: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

/*
HƯỚNG DẪN SỬ DỤNG:
1. Vào https://workers.cloudflare.com/
2. Tạo Worker mới với code trên
3. Deploy với subdomain: your-name.your-subdomain.workers.dev
4. Sử dụng domain này trong Zalo API Domains
5. Cập nhật Mini App để gọi Worker thay vì Supabase trực tiếp

VÍ DỤ:
- Worker URL: https://kajo-api.your-name.workers.dev
- Mini App gọi: https://kajo-api.your-name.workers.dev/notify_booking_created
- Worker tự động proxy tới: https://vekrhqotmgszgsredkud.functions.supabase.co/notify_booking_created
*/
