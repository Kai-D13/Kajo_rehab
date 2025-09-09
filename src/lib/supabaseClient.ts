import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL!;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function for Edge Function calls
export const callEdgeFunction = async (functionName: string, payload: any) => {
  const edgeBaseUrl = import.meta.env.VITE_EDGE_BASE_URL || `${url}/functions/v1`;
  
  const response = await fetch(`${edgeBaseUrl}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  return response.json();
};

// Export singleton instance để tránh multiple GoTrueClient instances
export default supabase;
