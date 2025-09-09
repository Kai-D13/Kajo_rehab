import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  
  const ok = (v: string | undefined) => Boolean(v && v.length > 8);
  
  const report = {
    supabase_url: ok(Deno.env.get("SUPABASE_URL")),
    service_role: ok(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
    admin_api_key: Boolean(Deno.env.get("ADMIN_API_KEY")),
    zalo_oa_id: Boolean(Deno.env.get("ZALO_OA_ID")),
    zalo_oa_token_present: ok(Deno.env.get("ZALO_OA_ACCESS_TOKEN")),
    zalo_oa_send_url: Boolean(Deno.env.get("ZALO_OA_SEND_URL")),
    zalo_oa_send_mode: Deno.env.get("ZALO_OA_SEND_MODE") || "uid",
    now: new Date().toISOString(),
  };
  
  return new Response(JSON.stringify({ ok: true, report }, null, 2), {
    headers: { "content-type": "application/json", ...cors },
  });
});
