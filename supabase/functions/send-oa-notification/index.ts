// deno-lint-ignore-file no-explicit-any
// Path: supabase/functions/send-oa-notification/index.ts
// Purpose: Send OA (Official Account) notifications for booking confirmations and reminders
// Auth: Service role or admin API key authentication

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_API_KEY = Deno.env.get("ADMIN_API_KEY") ?? "";
const ZALO_ACCESS_TOKEN = Deno.env.get("ZALO_ACCESS_TOKEN") ?? "";
const ZALO_OA_API_URL = "https://openapi.zalo.me/v3.0/oa/message";

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

interface NotificationRequest {
  booking_id: string;
  type: "confirmation" | "reminder" | "status_update";
  template_id?: string;
  custom_message?: string;
}

function generateMessage(booking: any, type: string, customMessage?: string): string {
  const { booking_code, customer_name, appointment_date, appointment_time, service_type } = booking;
  
  if (customMessage) {
    return customMessage;
  }
  
  switch (type) {
    case "confirmation":
      return `🎉 Xác nhận đặt khám!\n\nMã đặt khám: ${booking_code}\nKhách hàng: ${customer_name}\nNgày khám: ${appointment_date}\nGiờ khám: ${appointment_time}\nDịch vụ: ${service_type}\n\nCảm ơn bạn đã chọn dịch vụ của chúng tôi!`;
    
    case "reminder":
      return `⏰ Nhắc nhở khám bệnh!\n\nMã đặt khám: ${booking_code}\nKhách hàng: ${customer_name}\nNgày khám: ${appointment_date}\nGiờ khám: ${appointment_time}\n\nVui lòng có mặt đúng giờ. Cảm ơn!`;
    
    case "status_update":
      return `📋 Cập nhật trạng thái!\n\nMã đặt khám: ${booking_code}\nTrạng thái: ${booking.booking_status}\nCập nhật lúc: ${new Date().toLocaleString("vi-VN")}\n\nCảm ơn bạn!`;
    
    default:
      return `Thông báo về đặt khám ${booking_code}`;
  }
}

async function sendZaloOAMessage(userId: string, message: string): Promise<any> {
  if (!ZALO_ACCESS_TOKEN) {
    throw new Error("ZALO_ACCESS_TOKEN not configured");
  }

  const payload = {
    recipient: {
      user_id: userId
    },
    message: {
      text: message
    }
  };

  const response = await fetch(ZALO_OA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": ZALO_ACCESS_TOKEN
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zalo OA API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Authentication check
  const authHeader = req.headers.get("authorization");
  const adminKey = req.headers.get("x-admin-key");
  
  if (ADMIN_API_KEY && adminKey !== ADMIN_API_KEY && !authHeader?.includes("Bearer")) {
    return json({ error: "Unauthorized. Missing authentication." }, 401);
  }

  try {
    const body = await req.json();
    const { booking_id, type, template_id, custom_message }: NotificationRequest = body;

    if (!booking_id || !type) {
      return json({ error: "booking_id and type are required" }, 400);
    }

    if (!["confirmation", "reminder", "status_update"].includes(type)) {
      return json({ error: "Invalid notification type" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false }
    });

    // Fetch booking details
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

    // Check if user has Zalo ID
    if (!booking.zalo_user_id) {
      return json({ 
        error: "No Zalo User ID found for this booking",
        booking_id: booking_id
      }, 400);
    }

    // Generate message
    const message = generateMessage(booking, type, custom_message);

    // Send OA notification
    let oaResponse;
    try {
      oaResponse = await sendZaloOAMessage(booking.zalo_user_id, message);
    } catch (oaError) {
      console.error("❌ OA sending failed:", oaError);
      
      // Log failed notification
      await supabase
        .from("notification_logs")
        .insert({
          booking_id: booking_id,
          notification_type: "oa_message",
          status: "failed",
          recipient: booking.zalo_user_id,
          message_content: message,
          error_details: oaError.message,
          sent_at: new Date().toISOString()
        });

      return json({ 
        error: "Failed to send OA notification", 
        details: oaError.message 
      }, 500);
    }

    // Log successful notification
    await supabase
      .from("notification_logs")
      .insert({
        booking_id: booking_id,
        notification_type: "oa_message",
        status: "sent",
        recipient: booking.zalo_user_id,
        message_content: message,
        external_id: oaResponse?.data?.message_id || null,
        sent_at: new Date().toISOString()
      });

    console.log(`✅ OA notification sent: ${booking_id} -> ${booking.zalo_user_id}`);

    return json({
      success: true,
      message: "OA notification sent successfully",
      data: {
        booking_id: booking_id,
        booking_code: booking.booking_code,
        recipient: booking.zalo_user_id,
        notification_type: type,
        message_length: message.length,
        oa_response: oaResponse
      }
    });

  } catch (error) {
    console.error("❌ OA notification error:", error);
    return json({ 
      error: "Internal server error", 
      details: error?.message ?? "Unexpected error occurred" 
    }, 500);
  }
});
