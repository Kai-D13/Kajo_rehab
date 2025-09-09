// deno-lint-ignore-file no-explicit-any
// Path: supabase/functions/checkin/index.ts
// Purpose: Mark a booking as CHECKED_IN with timestamp, enforcing rules.
// Auth: Simple API key gate via X-Admin-Key (set ADMIN_API_KEY env) or open if not set.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_API_KEY = Deno.env.get("ADMIN_API_KEY") ?? ""; // optional

// CORS headers
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, x-admin-key, content-type",
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...cors },
  });
}

function todayInVN(): string {
  // Returns YYYY-MM-DD in Asia/Ho_Chi_Minh timezone
  const now = new Date();
  const vn = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const y = vn.getFullYear();
  const m = String(vn.getMonth() + 1).padStart(2, "0");
  const d = String(vn.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Optional admin key authentication
  if (ADMIN_API_KEY && req.headers.get("x-admin-key") !== ADMIN_API_KEY) {
    return json({ error: "Unauthorized. Missing or invalid X-Admin-Key header." }, 401);
  }

  try {
    const body = await req.json();
    const booking_id: string | undefined = body?.booking_id;
    const staff_id: string | null = body?.staff_id ?? null;

    if (!booking_id) {
      return json({ error: "booking_id is required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { 
      auth: { persistSession: false } 
    });

    // Fetch current booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) {
      return json({ 
        error: "Booking not found", 
        details: fetchError?.message 
      }, 404);
    }

    // Business rule: status must be pending or confirmed
    const allowedStatuses = ["pending", "confirmed"];
    if (!allowedStatuses.includes(booking.booking_status)) {
      return json({ 
        error: `Cannot check-in from status '${booking.booking_status}'. Allowed: ${allowedStatuses.join(", ")}`,
        current_status: booking.booking_status 
      }, 409);
    }

    // Business rule: appointment date must be today or later (VN timezone)
    const todayVN = todayInVN();
    if (booking.appointment_date < todayVN) {
      return json({ 
        error: "Appointment date has passed. Check-in not allowed.",
        appointment_date: booking.appointment_date,
        today_vn: todayVN
      }, 409);
    }

    // Perform check-in update
    const nowISO = new Date().toISOString();
    const { data, error: updateError } = await supabase
      .from("bookings")
      .update({
        booking_status: "checked_in",
        checkin_status: "checked_in", // Legacy field compatibility
        checkin_timestamp: nowISO,
        updated_at: nowISO,
        // Track who performed the check-in if provided
        ...(staff_id && { confirmed_by: `staff:${staff_id}` }),
      })
      .eq("id", booking_id)
      .select("*")
      .single();

    if (updateError) {
      return json({ 
        error: "Failed to update booking", 
        details: updateError.message 
      }, 400);
    }

    // Log successful check-in
    console.log(`✅ Check-in successful: ${booking_id} by ${staff_id || 'system'}`);

    return json({ 
      success: true, 
      message: "Check-in completed successfully",
      data: {
        booking_id: data.id,
        booking_code: data.booking_code,
        customer_name: data.customer_name,
        checkin_timestamp: data.checkin_timestamp,
        booking_status: data.booking_status,
        staff_id: staff_id
      }
    });

  } catch (error) {
    console.error("❌ Check-in error:", error);
    return json({ 
      error: "Internal server error", 
      details: error?.message ?? "Unexpected error occurred" 
    }, 500);
  }
});
