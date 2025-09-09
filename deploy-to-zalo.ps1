#!/usr/bin/env pwsh
# 🚀 ZALO MINI APP DEPLOYMENT SCRIPT v2.0
# Following official Zalo documentation: https://miniapp.zaloplatforms.com/documents/devtools/

Write-Host "🚀 STARTING ZALO MINI APP DEPLOYMENT..." -ForegroundColor Cyan
Write-Host "📱 App ID: 2403652688841115720" -ForegroundColor Yellow
Write-Host "🏥 App Name: kajotai-rehab-clinic" -ForegroundColor Yellow

# Step 1: Verify configuration
Write-Host "`n🔍 STEP 1: Verifying configuration..." -ForegroundColor Green

if (Test-Path "app-config.json") {
    Write-Host "✅ app-config.json found" -ForegroundColor Green
    $appConfig = Get-Content "app-config.json" | ConvertFrom-Json
    Write-Host "   App Title: $($appConfig.app.title)" -ForegroundColor Cyan
    Write-Host "   OA ID: $($appConfig.template.oaID)" -ForegroundColor Cyan
} else {
    Write-Host "❌ app-config.json not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "zmp-cli.json") {
    Write-Host "✅ zmp-cli.json found" -ForegroundColor Green
    $zmpConfig = Get-Content "zmp-cli.json" | ConvertFrom-Json
    Write-Host "   Framework: $($zmpConfig.framework)" -ForegroundColor Cyan
    Write-Host "   App ID: $($zmpConfig.appId)" -ForegroundColor Cyan
} else {
    Write-Host "❌ zmp-cli.json not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Clean and build
Write-Host "`n🏗️ STEP 2: Building project..." -ForegroundColor Green

# Clean previous build
if (Test-Path "www") {
    Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "www" -ErrorAction SilentlyContinue
}

# Build production version
Write-Host "📦 Building production version..." -ForegroundColor Yellow
npm run build

# Verify build output
if (Test-Path "www/index.html") {
    Write-Host "✅ Build successful - www/index.html created" -ForegroundColor Green
    
    # Show build contents
    Write-Host "📁 Build contents:" -ForegroundColor Cyan
    Get-ChildItem "www" | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Gray }
} else {
    Write-Host "❌ Build failed - www/index.html not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Pre-deployment checks
Write-Host "`n🔍 STEP 3: Pre-deployment checks..." -ForegroundColor Green

# Check if ZMP CLI is available
try {
    $zmpVersion = npm list -g zmp-cli --depth=0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ZMP CLI is installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ ZMP CLI not found globally, trying local..." -ForegroundColor Yellow
        npm list zmp-cli --depth=0 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ ZMP CLI found locally" -ForegroundColor Green
        } else {
            Write-Host "❌ ZMP CLI not found! Installing..." -ForegroundColor Red
            npm install -g zmp-cli
        }
    }
} catch {
    Write-Host "⚠️ Cannot verify ZMP CLI installation" -ForegroundColor Yellow
}

# Step 4: Deployment instructions
Write-Host "`n🚀 STEP 4: DEPLOYMENT INSTRUCTIONS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "`nTo complete deployment, please follow these steps:" -ForegroundColor Cyan

Write-Host "`n1️⃣ OPEN ZALO MINI APP EXTENSION IN VS CODE:" -ForegroundColor Yellow
Write-Host "   - Open VS Code in this directory: $(Get-Location)" -ForegroundColor White
Write-Host "   - Press Ctrl+Shift+X to open Extensions" -ForegroundColor White
Write-Host "   - Search for 'Zalo Mini App Extension'" -ForegroundColor White
Write-Host "   - Click on the Zalo Mini App icon in sidebar" -ForegroundColor White

Write-Host "`n2️⃣ CONFIGURE PROJECT:" -ForegroundColor Yellow
Write-Host "   - Click 'Cấu hình' button in Extension" -ForegroundColor White
Write-Host "   - Enter Mini App ID: 2403652688841115720" -ForegroundColor White
Write-Host "   - Complete all suggested actions in 'Chẩn đoán'" -ForegroundColor White

Write-Host "`n3️⃣ DEPLOY:" -ForegroundColor Yellow
Write-Host "   - Click 'Xuất bản' (Deploy) tab" -ForegroundColor White
Write-Host "   - Click 'Đăng nhập' and scan QR with Zalo app (Admin account)" -ForegroundColor White
Write-Host "   - Select 'Testing' version type" -ForegroundColor White
Write-Host "   - Enter description: 'Kajo System v2.0 - Production Ready'" -ForegroundColor White
Write-Host "   - Click 'Deploy' button" -ForegroundColor White

Write-Host "`n4️⃣ VERIFICATION:" -ForegroundColor Yellow
Write-Host "   - After successful deploy, you'll receive QR Code + Deep Link" -ForegroundColor White
Write-Host "   - Test on real device using Zalo app" -ForegroundColor White
Write-Host "   - Verify all features working correctly" -ForegroundColor White

Write-Host "`n📱 APP INFORMATION:" -ForegroundColor Green
Write-Host "   App ID: 2403652688841115720" -ForegroundColor Cyan
Write-Host "   App Name: kajotai-rehab-clinic" -ForegroundColor Cyan
Write-Host "   OA ID: 2339827548685253412" -ForegroundColor Cyan
Write-Host "   Framework: react-typescript" -ForegroundColor Cyan

Write-Host "`n✅ PRE-DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "📋 Build ready in 'www' directory" -ForegroundColor Green
Write-Host "🔄 Follow manual steps above to complete deployment" -ForegroundColor Green

Write-Host "`n================================================" -ForegroundColor Yellow
Write-Host "🎯 READY FOR ZALO MINI APP DEPLOYMENT!" -ForegroundColor Green
