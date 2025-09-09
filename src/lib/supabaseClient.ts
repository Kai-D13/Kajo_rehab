import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL!;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, { 
  auth: { 
    persistSession: true 
  } 
});

// Export singleton instance để tránh multiple GoTrueClient instances
export default supabase;
