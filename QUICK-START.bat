@echo off
echo.
echo ==========================================
echo   KAJO SYSTEM v2.0 - QUICK START GUIDE
echo ==========================================
echo.

echo Step 1: Get Zalo OA Access Token
echo --------------------------------
echo 1. Go to: https://oa.zalo.me/
echo 2. Navigate: Settings ^> App Management
echo 3. Copy your Access Token
echo.

echo Step 2: Set Environment Variables in Supabase
echo ---------------------------------------------
echo 1. Go to: https://supabase.com/dashboard
echo 2. Navigate: Settings ^> Environment Variables
echo 3. Add these variables:
echo    ADMIN_API_KEY=kajo-admin-2025-secure-key-random
echo    ZALO_ACCESS_TOKEN=[your-token-from-step-1]
echo.

echo Step 3: Deploy Database Migration
echo ---------------------------------
echo Run this command:
echo    supabase db push
echo.

echo Step 4: Deploy Edge Functions
echo -----------------------------
echo Run these commands:
echo    supabase functions deploy checkin
echo    supabase functions deploy checkout
echo    supabase functions deploy send-oa-notification
echo.

echo Step 5: Test the System
echo ----------------------
echo 1. Open: reception-system.html
echo 2. Test check-in/check-out functionality
echo 3. Verify booking codes display
echo.

echo CRITICAL: Complete Steps 1-2 FIRST before proceeding!
echo.
pause
