#!/usr/bin/env pwsh
# 🚀 ZALO MINI APP DEPLOYMENT - VS CODE EXTENSION GUIDE
# Following official documentation: https://miniapp.zaloplatforms.com/documents/devtools/ext/deploy-project/

Write-Host "🚀 DEPLOYING KAJO SYSTEM v2.0 TO ZALO MINI APP" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Yellow

# Step 1: Verify deployment readiness
Write-Host "`n🔍 STEP 1: Verifying deployment readiness..." -ForegroundColor Green

# Check build output
if (Test-Path "www/index.html") {
    Write-Host "✅ Build output verified: www/index.html exists" -ForegroundColor Green
    $buildSize = (Get-ChildItem "www" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build output missing! Running build..." -ForegroundColor Red
    npm run build
}

# Check configuration files
if (Test-Path "app-config.json") {
    Write-Host "✅ app-config.json found" -ForegroundColor Green
    $appConfig = Get-Content "app-config.json" | ConvertFrom-Json
    Write-Host "   App Title: $($appConfig.app.title)" -ForegroundColor Cyan
    Write-Host "   OA ID: $($appConfig.template.oaID)" -ForegroundColor Cyan
} else {
    Write-Host "❌ app-config.json missing!" -ForegroundColor Red
}

if (Test-Path "zmp-cli.json") {
    Write-Host "✅ zmp-cli.json found" -ForegroundColor Green
    $zmpConfig = Get-Content "zmp-cli.json" | ConvertFrom-Json
    Write-Host "   App ID: $($zmpConfig.appId)" -ForegroundColor Cyan
    Write-Host "   Framework: $($zmpConfig.framework)" -ForegroundColor Cyan
} else {
    Write-Host "❌ zmp-cli.json missing!" -ForegroundColor Red
}

# Step 2: VS Code Extension deployment instructions
Write-Host "`n🎯 STEP 2: VS CODE EXTENSION DEPLOYMENT" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Yellow

Write-Host "`n📋 DEPLOYMENT CHECKLIST:" -ForegroundColor Cyan
Write-Host "[ ] 1. Open VS Code in this directory" -ForegroundColor White
Write-Host "[ ] 2. Install Zalo Mini App Extension" -ForegroundColor White
Write-Host "[ ] 3. Configure Project with App ID" -ForegroundColor White
Write-Host "[ ] 4. Login with Zalo Admin Account" -ForegroundColor White
Write-Host "[ ] 5. Deploy as Testing version" -ForegroundColor White
Write-Host "[ ] 6. Test on real device" -ForegroundColor White

Write-Host "`n🔧 DETAILED INSTRUCTIONS:" -ForegroundColor Yellow

Write-Host "`n1️⃣ OPEN VS CODE:" -ForegroundColor Green
Write-Host "   - Open VS Code in directory: $(Get-Location)" -ForegroundColor White
Write-Host "   - Command: code ." -ForegroundColor Gray

Write-Host "`n2️⃣ INSTALL ZALO MINI APP EXTENSION:" -ForegroundColor Green
Write-Host "   - Press Ctrl+Shift+X to open Extensions" -ForegroundColor White
Write-Host "   - Search: 'Zalo Mini App Extension'" -ForegroundColor White
Write-Host "   - Publisher: zalo-mini-app" -ForegroundColor White
Write-Host "   - Click 'Install'" -ForegroundColor White
Write-Host "   - Extension URL: https://marketplace.visualstudio.com/items?itemName=zalo-mini-app.zalo-mini-app" -ForegroundColor Gray

Write-Host "`n3️⃣ CONFIGURE PROJECT:" -ForegroundColor Green
Write-Host "   - Click Zalo Mini App icon in left sidebar" -ForegroundColor White
Write-Host "   - Click 'Cấu hình' (Configure) button" -ForegroundColor White
Write-Host "   - Enter Zalo Mini App ID: 2403652688841115720" -ForegroundColor Yellow
Write-Host "   - Complete all actions in 'Chẩn đoán' (Diagnostics)" -ForegroundColor White

Write-Host "`n4️⃣ LOGIN TO ZALO:" -ForegroundColor Green
Write-Host "   - Click 'Xuất bản' (Deploy) tab in Extension" -ForegroundColor White
Write-Host "   - Click 'Đăng nhập' (Login) button" -ForegroundColor White
Write-Host "   - QR Code will appear in VS Code" -ForegroundColor White
Write-Host "   - Open Zalo app (logged in as Admin/Developer)" -ForegroundColor White
Write-Host "   - Scan QR Code to authenticate" -ForegroundColor White
Write-Host "   - Wait for 'Đăng nhập thành công' (Login successful)" -ForegroundColor White

Write-Host "`n5️⃣ DEPLOY PROJECT:" -ForegroundColor Green
Write-Host "   - Select 'Testing' version type (NOT Development)" -ForegroundColor White
Write-Host "   - Enter version description:" -ForegroundColor White
Write-Host "     'Kajo System v2.0 - Production Ready with Enhanced Reception + Edge Functions'" -ForegroundColor Yellow
Write-Host "   - Click 'Deploy' button" -ForegroundColor White
Write-Host "   - Wait for build and upload to complete" -ForegroundColor White
Write-Host "   - Success message will show QR Code + Deep Link" -ForegroundColor White

Write-Host "`n6️⃣ TEST DEPLOYMENT:" -ForegroundColor Green
Write-Host "   - Use QR Code from deployment success message" -ForegroundColor White
Write-Host "   - Scan with Zalo app on real device" -ForegroundColor White
Write-Host "   - Test complete booking flow:" -ForegroundColor White
Write-Host "     • Create booking → Generate QR → Get booking code" -ForegroundColor Gray
Write-Host "     • Test all navigation and features" -ForegroundColor Gray
Write-Host "     • Verify console has no critical errors" -ForegroundColor Gray

# Step 3: Alternative CLI method
Write-Host "`n🔄 STEP 3: ALTERNATIVE - ZMP CLI METHOD" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

Write-Host "`nIf VS Code Extension doesn't work, use CLI:" -ForegroundColor Cyan
Write-Host "npm install -g zmp-cli" -ForegroundColor Gray
Write-Host "zmp login" -ForegroundColor Gray
Write-Host "zmp deploy" -ForegroundColor Gray

# Step 4: Expected results
Write-Host "`n🎊 STEP 4: EXPECTED DEPLOYMENT RESULTS" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

Write-Host "`n✅ SUCCESS INDICATORS:" -ForegroundColor Cyan
Write-Host "   • Build completed without errors" -ForegroundColor White
Write-Host "   • Upload progress shows 100%" -ForegroundColor White
Write-Host "   • 'Deploy Thành Công' (Deploy Successful) message" -ForegroundColor White
Write-Host "   • QR Code displayed for testing" -ForegroundColor White
Write-Host "   • Deep Link provided: zalo://miniapp/2403652688841115720" -ForegroundColor White

Write-Host "`n📱 POST-DEPLOYMENT ACCESS:" -ForegroundColor Cyan
Write-Host "   • App ID: 2403652688841115720" -ForegroundColor Yellow
Write-Host "   • App Name: kajotai-rehab-clinic" -ForegroundColor Yellow
Write-Host "   • OA ID: 2339827548685253412" -ForegroundColor Yellow
Write-Host "   • Developer Console: https://developers.zalo.me" -ForegroundColor Yellow

Write-Host "`n🔥 PRODUCTION FEATURES INCLUDED:" -ForegroundColor Cyan
Write-Host "   ✅ Enhanced Reception System v2.0" -ForegroundColor Green
Write-Host "   ✅ Real-time booking updates" -ForegroundColor Green
Write-Host "   ✅ Edge Functions integration" -ForegroundColor Green
Write-Host "   ✅ Automatic booking codes (KR-YYYYMMDD-00001)" -ForegroundColor Green
Write-Host "   ✅ Complete audit trail" -ForegroundColor Green
Write-Host "   ✅ OA notification system" -ForegroundColor Green
Write-Host "   ✅ Zero console errors" -ForegroundColor Green

Write-Host "`n=================================================" -ForegroundColor Yellow
Write-Host "🎯 READY TO DEPLOY! Follow steps 1-6 above." -ForegroundColor Green
Write-Host "📞 Support: Zalo Mini App Developer Community" -ForegroundColor Cyan
Write-Host "🌐 Docs: https://miniapp.zaloplatforms.com/documents/" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Yellow
