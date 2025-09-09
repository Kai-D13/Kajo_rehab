// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ZALO_OA_ACCESS_TOKEN = Deno.env.get("ZALO_OA_ACCESS_TOKEN") ?? "";
const ZALO_OA_SEND_URL = Deno.env.get("ZALO_OA_SEND_URL") ?? "https://openapi.zalo.me/v3.0/oa/message";
const ZALO_OA_SEND_MODE = (Deno.env.get("ZALO_OA_SEND_MODE") as "uid"|"message_token") ?? "message_token";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const json = (b:any, s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json",...CORS}});

function buildText(booking: any) {
  const [y,m,d] = booking.appointment_date.split("-");
  const time = booking.appointment_time?.slice(0,5) || "";
  const when = `${d}/${m}/${y} ${time}`;
  const code = booking.booking_code ? ` | Mã: ${booking.booking_code}` : "";
  const service = booking.service_type ? ` | Dịch vụ: ${booking.service_type}` : "";
  const location = booking.clinic_location ? ` | CS: ${booking.clinic_location}` : "";
  const name = booking.customer_name ? `Chào ${booking.customer_name}, ` : "";
  return `${name}đặt lịch thành công${code}.\nThời gian: ${when}${service}${location}.\nHẹn gặp bạn tại KajoTai Rehab! 🏥`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  
  try {
    const { booking_id, recipient, mode } = await req.json();
    
    if (!booking_id) return json({ error: "booking_id required" }, 400);
    if (!recipient) return json({ error: "recipient (message_token hoặc user_id) required" }, 400);
    
    const sendMode = mode || ZALO_OA_SEND_MODE;
    
    // Lấy booking từ database
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: booking, error: fe } = await sb.from("bookings").select("*").eq("id", booking_id).single();
    
    if (fe || !booking) return json({ error: "Booking not found" }, 404);
    
    // Tạo message
    const text = buildText(booking);
    const messagePayload = sendMode === "message_token" 
      ? { recipient: { message_token: recipient }, message: { text } }
      : { recipient: { user_id: recipient }, message: { text } };
    
    // Headers cho Zalo OA API
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ZALO_OA_ACCESS_TOKEN}`
    };
    
    // Thêm miniapp_message_token header nếu mode là message_token
    if (sendMode === "message_token") {
      headers["miniapp_message_token"] = recipient;
    }
    
    // Gửi OA message
    const response = await fetch(ZALO_OA_SEND_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(messagePayload)
    });
    
    const result = await response.json();
    
    // Log kết quả
    await sb.from("notification_logs").insert({
      booking_id,
      recipient_type: sendMode,
      recipient_id: recipient,
      message_content: text,
      zalo_response: result,
      sent_at: new Date().toISOString(),
      success: response.ok && result.error === 0
    });
    
    if (response.ok && result.error === 0) {
      return json({ success: true, mode: sendMode, zalo_response: result });
    } else {
      return json({ error: "Failed to send notification", mode: sendMode, zalo_response: result }, 400);
    }
    
  } catch (e:any) {
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});
