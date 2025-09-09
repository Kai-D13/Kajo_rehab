// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ZALO_OA_ID = Deno.env.get("ZALO_OA_ID") ?? "";
const ZALO_OA_ACCESS_TOKEN = Deno.env.get("ZALO_OA_ACCESS_TOKEN") ?? "";
const ZALO_OA_SEND_URL = Deno.env.get("ZALO_OA_SEND_URL") ?? "https://openapi.zalo.me/v3.0/oa/message";
const ZALO_OA_SEND_MODE = (Deno.env.get("ZALO_OA_SEND_MODE") as "uid"|"message_token"|undefined) ?? "uid";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
};

function json(body: any, status=200) {
  return new Response(JSON.stringify(body), { 
    status, 
    headers: { "content-type":"application/json", ...cors }
  });
}

type Booking = {
  id:string; booking_status:string;
  customer_name:string|null; phone_number:string|null; user_id:string|null;
  appointment_date:string; appointment_time:string; clinic_location:string|null;
  service_type:string|null; booking_code:string|null;
};

function labelVN(d:string,t:string){ 
  const [y,m,dd]=d.split("-"); 
  return `${dd}/${m}/${y} ${(t||"").slice(0,5)}`; 
}

function buildText(b:Booking){
  const when=labelVN(b.appointment_date,b.appointment_time);
  const code=b.booking_code?` | Mã: ${b.booking_code}`:"";
  const svc=b.service_type?` | Dịch vụ: ${b.service_type}`:"";
  const loc=b.clinic_location?` | CS: ${b.clinic_location}`:"";
  const name=b.customer_name?`Chào ${b.customer_name}, `:"";
  return `${name}đặt lịch thành công${code}.\nThời gian: ${when}${svc}${loc}.\nHẹn gặp bạn tại KajoTai Rehab!`;
}

function payload(mode:"uid"|"message_token", recipient:string, text:string){
  return mode==="message_token"
    ? { recipient:{ message_token: recipient }, message:{ text } }
    : { recipient:{ user_id: recipient },      message:{ text } };
}

Deno.serve( async (req) => {
  if (req.method==="OPTIONS") return new Response(null,{headers:cors});
  
  try {
    const { booking_id, recipient, channel } = await req.json();
    
    if (!booking_id) {
      return json({error:"booking_id is required"},400);
    }
    
    if (!ZALO_OA_ACCESS_TOKEN) {
      return json({error:"Missing ZALO_OA_ACCESS_TOKEN env"},500);
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { 
      auth: { persistSession: false } 
    });

    const { data: b, error: fe } = await sb
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single<Booking>();

    if (fe || !b) {
      return json({error:"Booking not found"},404);
    }

    if (b.booking_status!=="confirmed") {
      return json({error:`Status '${b.booking_status}' not 'confirmed'`},409);
    }

    let mode: "uid"|"message_token" = ZALO_OA_SEND_MODE;
    let rcpt = recipient?.message_token ?? recipient?.uid ?? (mode==="uid" ? b.user_id : "");
    
    if (!rcpt) {
      await sb.from("notification_logs").insert({
        booking_id, channel: channel ?? "oa", recipient: "(missing)",
        status_code: 0, response_body: { error: "NO_RECIPIENT" }, payload_sent: null
      });
      return json({ warn:"No recipient provided or stored" }, 200);
    }

    const text = buildText(b);
    const body = payload(mode, rcpt, text);

    const res = await fetch(ZALO_OA_SEND_URL, {
      method:"POST",
      headers:{ 
        "content-type":"application/json", 
        "authorization":`Bearer ${ZALO_OA_ACCESS_TOKEN}` 
      },
      body: JSON.stringify(body)
    });

    const resp = await res.json().catch(()=>({raw:"<non-json>"}));

    await sb.from("notification_logs").insert({
      booking_id, channel: channel ?? "oa", recipient: rcpt,
      status_code: res.status, response_body: resp, payload_sent: body
    });

    if (!res.ok) {
      return json({
        error:"OA send failed", 
        status:res.status, 
        response:resp
      }, 502);
    }

    return json({ 
      ok:true, 
      booking_id, 
      oa_id: ZALO_OA_ID || undefined, 
      response:resp 
    });
  } catch (e) {
    return json({ error: e?.message ?? "Unexpected error" }, 500);
  }
});
