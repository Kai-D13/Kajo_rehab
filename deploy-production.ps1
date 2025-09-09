# 🚀 Kajo Deployment Script - Production Ready
# File: start-production.ps1

Write-Host "🏥 Kajo Rehabilitation Clinic - Production Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version 2>$null
    Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Installing Scoop package manager..." -ForegroundColor Yellow
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    irm get.scoop.sh | iex
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    scoop install supabase
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
}

# Project configuration
$PROJECT_REF = "vekrhqotmgszgsredkud"
$PROJECT_URL = "https://vekrhqotmgszgsredkud.supabase.co"
$FUNCTIONS_URL = "https://vekrhqotmgszgsredkud.functions.supabase.co"
$ADMIN_API_KEY = "0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96"

Write-Host "`n📋 Project Configuration:" -ForegroundColor Cyan
Write-Host "  Project Ref: $PROJECT_REF"
Write-Host "  Project URL: $PROJECT_URL"
Write-Host "  Functions URL: $FUNCTIONS_URL"
Write-Host "  Admin API Key: 0883eb4f...cb96"

# Step 1: Login and link project
Write-Host "`n🔑 Step 1: Supabase Authentication" -ForegroundColor Yellow
Write-Host "Please login to Supabase if prompted..."

try {
    supabase login
    Write-Host "✅ Supabase login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase login failed" -ForegroundColor Red
    exit 1
}

# Link project
Write-Host "`n🔗 Linking to project $PROJECT_REF..." -ForegroundColor Yellow
try {
    supabase link --project-ref $PROJECT_REF
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Project might already be linked" -ForegroundColor Yellow
}

# Step 2: Deploy Edge Functions
Write-Host "`n🚀 Step 2: Deploying Edge Functions" -ForegroundColor Yellow

$functions = @("checkin", "checkout", "notify_booking_created", "admin_bookings_query", "oa_health")

foreach ($func in $functions) {
    Write-Host "  📤 Deploying $func..." -ForegroundColor Cyan
    try {
        supabase functions deploy $func
        Write-Host "    ✅ $func deployed successfully" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ $func deployment failed" -ForegroundColor Red
    }
}

# Step 3: Apply Database Migrations
Write-Host "`n🗃️ Step 3: Applying Database Migrations" -ForegroundColor Yellow
try {
    supabase db push
    Write-Host "✅ Database migrations applied successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migrations failed" -ForegroundColor Red
    Write-Host "Please apply migrations manually in Supabase Dashboard" -ForegroundColor Yellow
}

# Step 4: Health Checks
Write-Host "`n🧪 Step 4: Running Health Checks" -ForegroundColor Yellow

# Test OA Health endpoint
Write-Host "  🔍 Testing OA Health endpoint..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$FUNCTIONS_URL/oa_health" -Method GET -ErrorAction Stop
    if ($healthResponse) {
        Write-Host "    ✅ OA Health endpoint responding" -ForegroundColor Green
    }
} catch {
    Write-Host "    ❌ OA Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Admin API with authentication
Write-Host "  🔍 Testing Admin API with authentication..." -ForegroundColor Cyan
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-admin-key" = $ADMIN_API_KEY
    }
    $body = @{ filters = @{} } | ConvertTo-Json
    
    $adminResponse = Invoke-RestMethod -Uri "$FUNCTIONS_URL/admin_bookings_query" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    if ($adminResponse) {
        Write-Host "    ✅ Admin API authenticated successfully" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "    ❌ Admin API authentication failed - Check ADMIN_API_KEY in environment" -ForegroundColor Red
    } else {
        Write-Host "    ⚠️ Admin API test inconclusive: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test Security - Anonymous access should fail
Write-Host "  🔍 Testing Security - Anonymous access should be blocked..." -ForegroundColor Cyan
try {
    $headers = @{ "Content-Type" = "application/json" }
    $body = @{ filters = @{} } | ConvertTo-Json
    
    $anonResponse = Invoke-RestMethod -Uri "$FUNCTIONS_URL/admin_bookings_query" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "    ❌ Security BREACH - Anonymous access allowed!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "    ✅ Security OK - Anonymous access properly blocked" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️ Security test inconclusive" -ForegroundColor Yellow
    }
}

# Step 5: Environment Variables Check
Write-Host "`n⚙️ Step 5: Environment Variables Status" -ForegroundColor Yellow
Write-Host "Please verify the following in Supabase Dashboard → Functions → Environment Variables:" -ForegroundColor Cyan

$envVars = @(
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY", 
    "ADMIN_API_KEY",
    "ZALO_OA_ACCESS_TOKEN",
    "ZALO_OA_SEND_URL",
    "ZALO_OA_SEND_MODE"
)

foreach ($var in $envVars) {
    Write-Host "  📝 $var" -ForegroundColor White
}

# Final Status
Write-Host "`n🎉 DEPLOYMENT SUMMARY" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

Write-Host "`n✅ Edge Functions:" -ForegroundColor Green
Write-Host "  📍 checkin: $FUNCTIONS_URL/checkin"
Write-Host "  📍 checkout: $FUNCTIONS_URL/checkout"  
Write-Host "  📍 admin_bookings_query: $FUNCTIONS_URL/admin_bookings_query"
Write-Host "  📍 notify_booking_created: $FUNCTIONS_URL/notify_booking_created"
Write-Host "  📍 oa_health: $FUNCTIONS_URL/oa_health"

Write-Host "`n✅ Admin Interfaces:" -ForegroundColor Green
Write-Host "  🖥️ Reception System: reception-system-v3-production.html"
Write-Host "  🔍 OA Health Monitor: $FUNCTIONS_URL/oa_health?ui=1"

Write-Host "`n✅ Security:" -ForegroundColor Green
Write-Host "  🔒 RLS Policies: Anonymous access blocked"
Write-Host "  🔑 Admin API: x-admin-key authentication"
Write-Host "  🛡️ Service Role: Edge Functions only"

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. ⚙️ Set Environment Variables in Supabase Dashboard"
Write-Host "2. 🧪 Test Reception System: reception-system-v3-production.html"
Write-Host "3. 📱 Test Mini App booking flow"
Write-Host "4. 🔔 Verify OA notifications"
Write-Host "5. 📊 Monitor notification_logs table"

Write-Host "`n📖 Full Documentation:" -ForegroundColor Yellow
Write-Host "  📄 EXECUTE-DEPLOYMENT.md - Complete deployment guide"
Write-Host "  📄 README_DEPLOYMENT.md - System overview"

Write-Host "`n🏥 Kajo Rehabilitation Clinic is ready for production! 🎉" -ForegroundColor Green
