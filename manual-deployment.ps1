# Manual Deployment Guide - Kajo System v2.0
# Since Supabase CLI is not available, follow these manual steps

Write-Host "🚀 KAJO SYSTEM v2.0 - MANUAL DEPLOYMENT" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

Write-Host "`n📊 STEP 3: Database Migration" -ForegroundColor Yellow
Write-Host "1. Go to: https://supabase.com/dashboard/project/vekrhqotmgszgsredkud" -ForegroundColor White
Write-Host "2. Navigate to: SQL Editor" -ForegroundColor White
Write-Host "3. Copy and paste the content from: apply-migration.sql" -ForegroundColor White
Write-Host "4. Run the SQL script" -ForegroundColor White
Write-Host "5. Verify success message appears" -ForegroundColor White

Write-Host "`n⚡ STEP 4: Edge Functions Deployment" -ForegroundColor Yellow
Write-Host "Since Supabase CLI is not available, you need to:" -ForegroundColor White
Write-Host "1. Install Supabase CLI first:" -ForegroundColor White
Write-Host "   npm install -g supabase" -ForegroundColor Cyan
Write-Host "2. Login to Supabase:" -ForegroundColor White
Write-Host "   supabase login" -ForegroundColor Cyan
Write-Host "3. Link to your project:" -ForegroundColor White
Write-Host "   supabase link --project-ref vekrhqotmgszgsredkud" -ForegroundColor Cyan
Write-Host "4. Deploy functions:" -ForegroundColor White
Write-Host "   supabase functions deploy checkin" -ForegroundColor Cyan
Write-Host "   supabase functions deploy checkout" -ForegroundColor Cyan
Write-Host "   supabase functions deploy send-oa-notification" -ForegroundColor Cyan

Write-Host "`n🧪 STEP 5: Testing" -ForegroundColor Yellow
Write-Host "1. Open reception-system.html in browser" -ForegroundColor White
Write-Host "2. Test check-in/check-out functionality" -ForegroundColor White
Write-Host "3. Verify booking codes display" -ForegroundColor White
Write-Host "4. Test real-time updates" -ForegroundColor White

Write-Host "`n📋 ALTERNATIVE: Manual Function Creation" -ForegroundColor Yellow
Write-Host "If CLI installation fails, you can manually create Edge Functions:" -ForegroundColor White
Write-Host "1. Go to: Supabase Dashboard > Edge Functions" -ForegroundColor White
Write-Host "2. Create new function for each: checkin, checkout, send-oa-notification" -ForegroundColor White
Write-Host "3. Copy paste the TypeScript code from supabase/functions/*/index.ts" -ForegroundColor White

Write-Host "`n✅ Environment Variables (Already Set)" -ForegroundColor Green
Write-Host "ADMIN_API_KEY: ✅ Set" -ForegroundColor Green
Write-Host "ZALO_ACCESS_TOKEN: ✅ Set" -ForegroundColor Green

Write-Host "`n🎯 Current Status:" -ForegroundColor Cyan
Write-Host "✅ Source code complete" -ForegroundColor Green
Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host "⏳ Database migration (manual step required)" -ForegroundColor Yellow
Write-Host "⏳ Edge Functions deployment (CLI setup required)" -ForegroundColor Yellow

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
Read-Host
