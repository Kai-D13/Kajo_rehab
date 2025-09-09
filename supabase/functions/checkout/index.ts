// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_API_KEY = Deno.env.get("ADMIN_API_KEY") ?? "";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-admin-key",
};
const json = (b:any, s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json",...CORS}});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.headers.get("x-admin-key") !== ADMIN_API_KEY) return json({ error: "Unauthorized" }, 401);

  try {
    const { booking_id, staff_id } = await req.json();
    if (!booking_id) return json({ error: "booking_id is required" }, 400);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const { data: b, error: fe } = await sb.from("bookings").select("*").eq("id", booking_id).single();
    if (fe || !b) return json({ error: "Booking not found" }, 404);
    if (b.booking_status !== "checked_in") {
      return json({ error: `Cannot check-out from status '${b.booking_status}'` }, 409);
    }

    const now = new Date().toISOString();
    const { data, error: ue } = await sb.from("bookings").update({
      booking_status: "checked_out",
      checkout_timestamp: now,
      updated_at: now,
      confirmed_by: b.confirmed_by ?? (staff_id || "system_auto"),
    }).eq("id", booking_id).select("*").single();
    if (ue) return json({ error: ue.message }, 400);

    // (optional) ghi log sự kiện
    // await sb.from("booking_events").insert({ booking_id, old_status: b.booking_status, new_status: "checked_out", actor: staff_id || "reception" });

    return json({ ok: true, data });
  } catch (e:any) {
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});
