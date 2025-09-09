# Kajo System v2.0 - Production Deployment Script
# This script deploys all components for production readiness

Write-Host "🚀 Kajo System v2.0 - Production Deployment Starting..." -ForegroundColor Green

# Check if Supabase CLI is installed
Write-Host "📋 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = & supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase CLI is installed: $supabaseVersion" -ForegroundColor Green
    } else {
        throw "Supabase CLI not found"
    }
} catch {
    Write-Host "❌ Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Apply database migrations
Write-Host "📊 Applying database migrations..." -ForegroundColor Yellow
try {
    & supabase db push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrations applied successfully" -ForegroundColor Green
    } else {
        throw "Migration failed"
    }
} catch {
    Write-Host "❌ Database migration failed. Please check your database connection." -ForegroundColor Red
    Write-Host "   Make sure you're linked to the correct project:" -ForegroundColor Yellow
    Write-Host "   supabase link --project-ref vekrhqotmgszgsredkud" -ForegroundColor Yellow
    exit 1
}

# Deploy Edge Functions
Write-Host "🔧 Deploying Edge Functions..." -ForegroundColor Yellow

$functions = @("checkin", "checkout", "notify_booking_created", "healthz")

foreach ($func in $functions) {
    Write-Host "  📦 Deploying function: $func" -ForegroundColor Cyan
    try {
        & supabase functions deploy $func
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ $func deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  $func deployment failed, continuing..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    ❌ Error deploying $func" -ForegroundColor Red
    }
}

# Check environment variables
Write-Host "⚙️  Checking environment variables..." -ForegroundColor Yellow
Write-Host "   Please ensure these environment variables are set in Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "   - SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "   - ADMIN_API_KEY=kajo-admin-2025" -ForegroundColor Gray
Write-Host "   - ZALO_OA_ID=2339827548685253412" -ForegroundColor Gray
Write-Host "   - ZALO_OA_ACCESS_TOKEN=<your_token>" -ForegroundColor Gray
Write-Host "   - ZALO_OA_SEND_URL=https://openapi.zalo.me/v3.0/oa/message" -ForegroundColor Gray
Write-Host "   - ZALO_OA_SEND_MODE=uid" -ForegroundColor Gray

# Test health endpoint
Write-Host "🏥 Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthUrl = "https://vekrhqotmgszgsredkud.supabase.co/functions/v1/healthz"
    $response = Invoke-RestMethod -Uri $healthUrl -Method GET
    if ($response.ok) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-Host "   Environment status:" -ForegroundColor Cyan
        $response.report | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Health check returned non-OK status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This is normal if environment variables are not set yet." -ForegroundColor Yellow
}

# Build frontend
Write-Host "🏗️  Building frontend..." -ForegroundColor Yellow
try {
    & npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend build failed, but continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend build error" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. ⚙️  Set environment variables in Supabase Dashboard" -ForegroundColor Cyan
Write-Host "2. 🔄 Update Zalo access token if needed" -ForegroundColor Cyan
Write-Host "3. 🧪 Run end-to-end testing" -ForegroundColor Cyan
Write-Host "4. 🚀 Go live!" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🔗 Useful URLs:" -ForegroundColor Yellow
Write-Host "   Health Check: https://vekrhqotmgszgsredkud.supabase.co/functions/v1/healthz" -ForegroundColor Gray
Write-Host "   Reception System: ./reception-system-v2-production.html" -ForegroundColor Gray
Write-Host "   Supabase Dashboard: https://supabase.com/dashboard/project/vekrhqotmgszgsredkud" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
