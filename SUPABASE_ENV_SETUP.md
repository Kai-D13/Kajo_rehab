# ===== SUPABASE ENVIRONMENT VARIABLES =====
# Instructions: Set these in Supabase Dashboard > Project Settings > Edge Functions > Environment Variables

# Core Supabase Configuration
SUPABASE_URL=https://vekrhqotmgszgsredkud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkzMjU1NiwiZXhwIjoyMDcxNTA4NTU2fQ.R9HBRVt9Cg1jThW0k9SfFQpylLBEI_KTTS4aCcUmjTE

# Admin API Security
ADMIN_API_KEY=kajo-admin-2025

# Zalo Official Account Configuration
ZALO_OA_ID=2339827548685253412
ZALO_OA_ACCESS_TOKEN=iSOd6NHvp4spmoaKVdl5HBh2BnT_O9v4m88975X3aGduhWq-GLMX1koTCoDEK8DqbhLkKYi0r5wgxaDO73hR2hZEFoueARiMjC0d0WO7dJJ5stCDMMFMNEgYCtalUjPsdv0vVZ9tY4YYimL164wiKwlwEKCy09P0aw4OO5zcW3ISWWmi0twaAOocJmifOU9QdTL-3b5XonljX5S-VN72Ex-4KHuZF_GDWSKRLG9nj42soY1FTYEDP-l65YjEFev_pDGHIaifkNBvzYXMHn-g0f_0JY1I0CalajrP6bDduGdeidylIdhxUiYoOrvNJUjNrvTfPHH3_r2GcL41547R2z6zCXv0Iwr9XwK0OpP5ZcYFWc1Z9LR-CxRlMGWGAUj4Y-jb5JylyZswy08GEIpc9eBoLNCV4xjBUJVrZDrXS6J8J0
ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message
ZALO_OA_SEND_MODE=uid

# ===== DEPLOYMENT INSTRUCTIONS =====

# 1. Supabase Dashboard Setup:
#    - Go to https://supabase.com/dashboard
#    - Select your project: vekrhqotmgszgsredkud
#    - Navigate to Project Settings > Edge Functions
#    - Add each environment variable above

# 2. Verify Variables:
#    - Test with oa_health function
#    - Check admin_bookings_query function

# 3. Security Notes:
#    - Service role key has full database access
#    - Admin API key protects reception functions
#    - OA access token expires (monitor via health check)

# ===== ALTERNATIVE SETUP (if Dashboard unavailable) =====
# Use Supabase CLI:
# supabase secrets set SUPABASE_URL=https://vekrhqotmgszgsredkud.supabase.co
# supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# supabase secrets set ADMIN_API_KEY=kajo-admin-2025
# supabase secrets set ZALO_OA_ID=2339827548685253412
# supabase secrets set ZALO_OA_ACCESS_TOKEN=iSOd6NHvp4spmoaKVdl5HBh2BnT_O9v4...
# supabase secrets set ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message
# supabase secrets set ZALO_OA_SEND_MODE=uid
