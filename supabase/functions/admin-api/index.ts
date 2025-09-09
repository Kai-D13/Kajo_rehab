import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AdminRequest {
  action: 'approve' | 'reject' | 'checkin' | 'query';
  bookingId?: string;
  staffUsername?: string;
  filter?: {
    phone?: string;
    dateStart?: string;
    dateEnd?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== 'kajo-admin-2025') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized access' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://vekrhqotmgszgsredkud.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkzMjU1NiwiZXhwIjoyMDcxNTA4NTU2fQ.R9HBRVt9Cg1jThW0k9SfFQpylLBEI_KTTS4aCcUmjTE'
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const body: AdminRequest = await req.json();
    const { action, bookingId, staffUsername = 'system', filter } = body;

    console.log(`🔧 Admin action: ${action} for booking ${bookingId || 'query'} by ${staffUsername}`);

    // Handle query action for reception system
    if (action === 'query') {
      let query = supabaseClient
        .from('bookings')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      // Apply filters
      if (filter?.phone) {
        query = query.ilike('phone_number', `%${filter.phone}%`);
      }

      if (filter?.dateStart) {
        query = query.gte('appointment_date', filter.dateStart);
      }

      if (filter?.dateEnd) {
        query = query.lte('appointment_date', filter.dateEnd);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: `Database error: ${error.message}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`✅ Successfully retrieved ${data?.length || 0} bookings`);

      return new Response(
        JSON.stringify({ 
          ok: true, 
          data: data || [],
          filter: filter,
          count: data?.length || 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Existing booking update logic
    if (!bookingId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Booking ID is required for this action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updateData: any = {};
    let successMessage = '';

    switch (action) {
      case 'approve':
        updateData = {
          booking_status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: staffUsername,
        };
        successMessage = 'Booking approved successfully';
        break;

      case 'reject':
        updateData = {
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: staffUsername,
        };
        successMessage = 'Booking cancelled successfully';
        break;

      case 'checkin':
        updateData = {
          checkin_status: 'checked_in',
          checkin_timestamp: new Date().toISOString(),
          checkin_by: staffUsername,
        };
        successMessage = 'Patient checked in successfully';
        break;

      default:
        return new Response('Invalid action', { status: 400, headers: corsHeaders });
    }

    // Update booking with service role privileges
    const { data, error } = await supabaseClient
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Database update error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Booking updated successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: successMessage,
        booking: data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
