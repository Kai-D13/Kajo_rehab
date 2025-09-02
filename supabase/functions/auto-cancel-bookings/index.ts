// Supabase Edge Function: Auto-cancel expired bookings
// Deploy: supabase functions deploy auto-cancel-bookings
// Chạy hàng ngày bằng cron job

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Khởi tạo Supabase client với service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Starting auto-cancel expired bookings process...')

    // Gọi stored procedure để auto-cancel
    const { error } = await supabaseAdmin.rpc('auto_cancel_expired_bookings')

    if (error) {
      console.error('❌ Error in auto-cancel:', error)
      throw error
    }

    // Get statistics của những booking đã được cancel
    const { data: cancelledBookings, error: statsError } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_name, phone_number, appointment_date')
      .eq('booking_status', 'auto_cancelled')
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h

    if (statsError) {
      console.warn('Failed to get stats:', statsError)
    }

    const result = {
      success: true,
      message: 'Auto-cancel process completed',
      cancelled_count: cancelledBookings?.length || 0,
      cancelled_bookings: cancelledBookings || [],
      timestamp: new Date().toISOString()
    }

    console.log('✅ Auto-cancel completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

/* 
Deploy instructions:
1. supabase functions deploy auto-cancel-bookings
2. Set up cron job to call this function daily:
   - URL: https://vekrhqotmgszgsredkud.supabase.co/functions/v1/auto-cancel-bookings
   - Method: POST
   - Headers: Authorization: Bearer [service_role_key]
3. Schedule với external cron service hoặc Supabase Cron (if available)
*/
