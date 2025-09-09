// deno-lint-ignore-file no-explicit-any
// Path: supabase/functions/checkout/index.ts
// Purpose: Mark a booking as CHECKED_OUT with timestamp, enforcing rules.
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

function calculateDuration(checkinTime: string, checkoutTime: string): string {
  const checkin = new Date(checkinTime);
  const checkout = new Date(checkoutTime);
  const diffMs = checkout.getTime() - checkin.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
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
    const notes: string | null = body?.notes ?? null;

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

    // Business rule: must be in checked_in status to check-out
    if (booking.booking_status !== "checked_in") {
      return json({ 
        error: `Cannot check-out from status '${booking.booking_status}'. Must be 'checked_in'.`,
        current_status: booking.booking_status 
      }, 409);
    }

    // Business rule: must have check-in timestamp
    if (!booking.checkin_timestamp) {
      return json({ 
        error: "No check-in timestamp found. Cannot check-out without check-in.",
        booking_status: booking.booking_status
      }, 409);
    }

    // Perform check-out update
    const nowISO = new Date().toISOString();
    const duration = calculateDuration(booking.checkin_timestamp, nowISO);
    
    const { data, error: updateError } = await supabase
      .from("bookings")
      .update({
        booking_status: "checked_out",
        checkout_timestamp: nowISO,
        updated_at: nowISO,
        // Track who performed the check-out if provided
        ...(staff_id && { confirmed_by: `staff:${staff_id}` }),
        // Add notes if provided (you might need to add this column)
        ...(notes && { detailed_description: booking.detailed_description + `\n[Check-out notes: ${notes}]` }),
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

    // Log successful check-out
    console.log(`✅ Check-out successful: ${booking_id} by ${staff_id || 'system'} (Duration: ${duration})`);

    return json({ 
      success: true, 
      message: "Check-out completed successfully",
      data: {
        booking_id: data.id,
        booking_code: data.booking_code,
        customer_name: data.customer_name,
        checkin_timestamp: data.checkin_timestamp,
        checkout_timestamp: data.checkout_timestamp,
        duration: duration,
        booking_status: data.booking_status,
        staff_id: staff_id
      }
    });

  } catch (error) {
    console.error("❌ Check-out error:", error);
    return json({ 
      error: "Internal server error", 
      details: error?.message ?? "Unexpected error occurred" 
    }, 500);
  }
});
