// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ZALO_OA_ID = Deno.env.get("ZALO_OA_ID") ?? "";
const ZALO_OA_ACCESS_TOKEN = Deno.env.get("ZALO_OA_ACCESS_TOKEN") ?? "";
const ZALO_OA_SEND_URL = Deno.env.get("ZALO_OA_SEND_URL") ?? "https://openapi.zalo.me/v3.0/oa/message";
const ZALO_OA_SEND_MODE = (Deno.env.get("ZALO_OA_SEND_MODE") as "uid"|"message_token"|undefined) ?? "uid";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-admin-key"
};

const json = (body: any, status = 200) => 
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json", ...cors }
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method === "GET") {
    // Health check - return environment status
    return json({
      ok: true,
      report: {
        zalo_oa_id_present: !!ZALO_OA_ID,
        zalo_oa_token_present: !!(ZALO_OA_ACCESS_TOKEN && ZALO_OA_ACCESS_TOKEN.length > 8),
        zalo_oa_send_url: ZALO_OA_SEND_URL,
        zalo_oa_send_mode: ZALO_OA_SEND_MODE,
        now: new Date().toISOString(),
        server: "Kajo OA Health Check v1.0"
      }
    });
  }

  if (req.method === "POST") {
    if (!ZALO_OA_ACCESS_TOKEN) {
      return json({ ok: false, error: "Missing ZALO_OA_ACCESS_TOKEN" }, 500);
    }

    const { recipient, text } = await req.json();
    let rcpt = "";
    let mode: "uid" | "message_token" = ZALO_OA_SEND_MODE;

    if (recipient?.message_token) {
      mode = "message_token";
      rcpt = recipient.message_token;
    } else if (recipient?.uid) {
      mode = "uid";
      rcpt = recipient.uid;
    }

    if (!rcpt) {
      return json({
        ok: false,
        error: "Provide recipient.uid or recipient.message_token"
      }, 400);
    }

    const payload = mode === "message_token" 
      ? {
          recipient: { message_token: rcpt },
          message: { text: text || "[Test] Kajo OA health check - System operational ✅" }
        }
      : {
          recipient: { user_id: rcpt },
          message: { text: text || "[Test] Kajo OA health check - System operational ✅" }
        };

    console.log(`🔔 Sending test message via ${mode} to:`, rcpt);

    const res = await fetch(ZALO_OA_SEND_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${ZALO_OA_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const body = await res.json().catch(() => ({ raw: "<non-json>" }));
    
    console.log(`📊 OA Response:`, { status: res.status, body });

    return json({
      ok: res.ok,
      status: res.status,
      response: body,
      mode_used: mode,
      recipient_sent_to: rcpt
    });
  }

  return json({ ok: false, error: "Method not allowed" }, 405);
});
