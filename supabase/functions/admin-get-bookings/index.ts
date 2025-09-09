import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const { filter } = await req.json();
    
    console.log('🔍 Admin query bookings with filter:', filter);

    // Build query
    let query = supabase
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

    // Execute query
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

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: `Function error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
