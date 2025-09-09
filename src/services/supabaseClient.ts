import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vekrhqotmgszgsredkud.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzI1NTYsImV4cCI6MjA3MTUwODU1Nn0.KdUmhaSVPfWOEVgJ4C9Ybc0-IxO_Xs6mp8KUlYE_8cQ';

// Singleton Supabase client to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storageKey: 'kajo-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        headers: {
          'X-Client-Info': 'kajo-miniapp@1.0.0',
        },
      },
    });
    
    console.log('✅ Singleton Supabase client initialized');
  }
  
  return supabaseInstance;
}

// Export default instance
export const supabase = getSupabaseClient();

// Type definitions
export type { SupabaseClient } from '@supabase/supabase-js';
