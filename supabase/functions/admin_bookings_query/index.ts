// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_API_KEY = Deno.env.get("ADMIN_API_KEY") ?? "kajo-admin-2025";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-admin-key"
};

const json = (body: any, status = 200) => 
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors }
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Admin authentication
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== ADMIN_API_KEY) {
    return json({ error: "Unauthorized - Invalid admin key" }, 401);
  }

  try {
    const { phone, dateStart, dateEnd, limit = 500 } = await req.json();

    console.log(`🔍 Admin query: phone=${phone}, dateStart=${dateStart}, dateEnd=${dateEnd}, limit=${limit}`);

    // Create service role client (bypasses RLS)
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false }
    });

    // Build query
    let q = sb
      .from("bookings")
      .select("*")
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: true })
      .limit(limit);

    // Apply filters
    if (phone) {
      q = q.ilike("phone_number", `%${phone}%`);
    }
    if (dateStart) {
      q = q.gte("appointment_date", dateStart);
    }
    if (dateEnd) {
      q = q.lte("appointment_date", dateEnd);
    }

    const { data, error } = await q;

    if (error) {
      console.error("❌ Database error:", error);
      return json({ error: error.message }, 400);
    }

    console.log(`✅ Successfully retrieved ${data?.length || 0} bookings`);

    return json({
      ok: true,
      data: data || [],
      count: data?.length || 0,
      filter: { phone, dateStart, dateEnd },
      timestamp: new Date().toISOString()
    });

  } catch (e) {
    console.error("❌ Function error:", e);
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});
