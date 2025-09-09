# Supabase CLI Installation and Edge Functions Deployment
# Run this to complete the Edge Functions deployment

Write-Host "🚀 SUPABASE CLI SETUP & EDGE FUNCTIONS DEPLOYMENT" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Check if npm is available
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing Supabase CLI globally..." -ForegroundColor Yellow
try {
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Supabase CLI: $_" -ForegroundColor Red
    Write-Host "💡 Try running as Administrator or use: npm install -g supabase --force" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔐 Login to Supabase..." -ForegroundColor Yellow
Write-Host "This will open a browser for authentication" -ForegroundColor White
try {
    supabase login
    Write-Host "✅ Supabase login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase login failed: $_" -ForegroundColor Red
    Write-Host "💡 Please run 'supabase login' manually" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔗 Linking to Kajo project..." -ForegroundColor Yellow
try {
    supabase link --project-ref vekrhqotmgszgsredkud
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Project linking failed: $_" -ForegroundColor Red
    Write-Host "💡 Make sure you have access to the project" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n⚡ Deploying Edge Functions..." -ForegroundColor Yellow

# Deploy checkin function
Write-Host "Deploying checkin function..." -ForegroundColor White
try {
    supabase functions deploy checkin
    Write-Host "✅ Checkin function deployed" -ForegroundColor Green
} catch {
    Write-Host "❌ Checkin function deployment failed: $_" -ForegroundColor Red
}

# Deploy checkout function
Write-Host "Deploying checkout function..." -ForegroundColor White
try {
    supabase functions deploy checkout
    Write-Host "✅ Checkout function deployed" -ForegroundColor Green
} catch {
    Write-Host "❌ Checkout function deployment failed: $_" -ForegroundColor Red
}

# Deploy OA notification function
Write-Host "Deploying send-oa-notification function..." -ForegroundColor White
try {
    supabase functions deploy send-oa-notification
    Write-Host "✅ OA notification function deployed" -ForegroundColor Green
} catch {
    Write-Host "❌ OA notification function deployment failed: $_" -ForegroundColor Red
}

Write-Host "`n🧪 Testing Edge Functions..." -ForegroundColor Yellow
Write-Host "You can test the functions using these URLs:" -ForegroundColor White
Write-Host "- Checkin: https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkin" -ForegroundColor Cyan
Write-Host "- Checkout: https://vekrhqotmgszgsredkud.supabase.co/functions/v1/checkout" -ForegroundColor Cyan
Write-Host "- OA Notification: https://vekrhqotmgszgsredkud.supabase.co/functions/v1/send-oa-notification" -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Update ZALO_ACCESS_TOKEN with fresh token (current one expired)" -ForegroundColor White
Write-Host "2. Test the enhanced reception system: reception-system.html" -ForegroundColor White
Write-Host "3. Test check-in/check-out workflow" -ForegroundColor White

Write-Host "`n✅ Edge Functions deployment completed!" -ForegroundColor Green
Write-Host "Your Kajo System v2.0 is now ready for production! 🎉" -ForegroundColor Green

pause
