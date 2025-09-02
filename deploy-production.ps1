# Production Mini App Deployment Script
# KajoTai Rehab Clinic - Zalo Mini App

Write-Host "🏥 KajoTai Rehab Clinic - Mini App Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Step 1: Environment Check
Write-Host "`n🔍 Checking environment..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found! Please install Node.js" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Install Dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Step 3: Environment Configuration Check
Write-Host "`n⚙️ Checking configuration..." -ForegroundColor Yellow

if (Test-Path ".env.production") {
    Write-Host "✅ Production environment file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.production not found!" -ForegroundColor Red
    Write-Host "Please ensure production environment is configured" -ForegroundColor Red
    exit 1
}

# Step 4: Build Production
Write-Host "`n🔨 Building for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Production build completed" -ForegroundColor Green

# Step 5: Start Mini App
Write-Host "`n🚀 Starting Zalo Mini App..." -ForegroundColor Yellow
Write-Host "App will open in Zalo Developer Tools" -ForegroundColor Cyan

# Try different methods to start the Mini App
Write-Host "Attempting to start with zmp-cli..." -ForegroundColor Yellow

npx zmp-cli start

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ zmp-cli start failed. Trying alternative methods..." -ForegroundColor Yellow
    
    # Alternative 1: Development server
    Write-Host "Starting development server..." -ForegroundColor Yellow
    
    try {
        npm run dev
    } catch {
        # Alternative 2: Manual instructions
        Write-Host "`n📋 Manual Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open Zalo Developer Console: https://developers.zalo.me" -ForegroundColor White
        Write-Host "2. Go to Mini App section" -ForegroundColor White
        Write-Host "3. Select your app: KajoTai Rehab Clinic (2403652688841115720)" -ForegroundColor White
        Write-Host "4. Upload the 'dist' folder as production build" -ForegroundColor White
        Write-Host "5. Configure production domain and callbacks" -ForegroundColor White
        Write-Host "6. Submit for review and deployment" -ForegroundColor White
        
        Write-Host "`n🔗 Quick Links:" -ForegroundColor Cyan
        Write-Host "• Zalo Developer: https://developers.zalo.me" -ForegroundColor White
        Write-Host "• Mini App Console: https://mini.zalo.me" -ForegroundColor White
        Write-Host "• OA Management: https://oa.zalo.me" -ForegroundColor White
        
        Write-Host "`n📱 Testing URLs:" -ForegroundColor Cyan
        Write-Host "• Local Test: file:///$PWD/complete-system-test.html" -ForegroundColor White
        Write-Host "• End-to-End: file:///$PWD/end-to-end-test.html" -ForegroundColor White
    }
}

Write-Host "`n🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "Check the output above for next steps" -ForegroundColor Green
