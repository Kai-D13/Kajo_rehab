// Production configuration - VERIFIED AND WORKING
export const config = {
  // Supabase Configuration
  supabase: {
    url: 'https://vekrhqotmgszgsredkud.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzI1NTYsImV4cCI6MjA3MTUwODU1Nn0.KdUmhaSVPfWOEVgJ4C9Ybc0-IxO_Xs6mp8KUlYE_8cQ',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkzMjU1NiwiZXhwIjoyMDcxNTA4NTU2fQ.R9HBRVt9Cg1jThW0k9SfFQpylLBEI_KTTS4aCcUmjTE'
  },
  
  // Zalo Configuration
  zalo: {
    oaAccessToken: 'iSOd6NHvp4spmoaKVdl5HBh2BnT_O9v4m88975X3aGduhWq-GLMX1koTCoDEK8DqbhLkKYi0r5wgxaDO73hR2hZEFoueARiMjC0d0WO7dJJ5stCDMMFMNEgYCtalUjPsdv0vVZ9tY4YYimL164wiKwlwEKCy09P0aw4OO5zcW3ISWWmi0twaAOocJmifOU9QdTL-3b5XonljX5S-VN72Ex-4KHuZF_GDWSKRLG9nj42soY1FTYEDP-l65YjEFev_pDGHIaifkNBvzYXMHn-g0f_0JY1I0CalajrP6bDduGdeidylIdhxUiYoOrvNJUjNrvTfPHH3_r2GcL41547R2z6zCXv0Iwr9XwK0OpP5ZcYFWc1Z9LR-CxRlMGWGAUj4Y-jb5JylyZswy08GEIpc9eBoLNCV4xjBUJVrZDrXS6J8J0',
    oaId: '2339827548685253412',
    miniAppId: '2403652688841115720',
    miniAppSecret: 'wvSuPaGhq5MzQRJjGOYW'
  },
  
  // Environment detection
  isDevelopment: import.meta.env?.DEV || window.location.hostname === 'localhost'
};

console.log('✅ Config loaded successfully:', {
  supabaseUrl: config.supabase.url,
  supabaseAnonKey: config.supabase.anonKey ? '✓ LOADED' : '❌ MISSING',
  zaloOAId: config.zalo.oaId,
  miniAppId: config.zalo.miniAppId,
  isDevelopment: config.isDevelopment
});
