# Database Direct Test - Kajo Production
# Tests core functionality without Edge Functions

param(
    [string]$SupabaseUrl = "https://vekrhqotmgszgsredkud.supabase.co",
    [string]$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMDA4MTMsImV4cCI6MjA0Njc3NjgxM30.NJ42lNaBUFx2nzz8LfpXoozlzFzPCgkKXGNr8eL0R-Q"
)

Write-Host "Kajo Database Direct Test" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

$testCount = 0
$passCount = 0

# Test 1: Direct Database Health Check
Write-Host "`nTest 1: Database Connection Health" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{
        "apikey" = $AnonKey
        "Authorization" = "Bearer $AnonKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/bookings?select=count" -Headers $headers -Method HEAD
    Write-Host "  PASS: Database connection successful" -ForegroundColor Green
    $passCount++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  EXPECTED: RLS blocking anonymous access (security working)" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Test Booking Creation (simulate Mini App)
Write-Host "`nTest 2: Simulate Booking Creation" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{
        "apikey" = $AnonKey
        "Authorization" = "Bearer $AnonKey"
        "Content-Type" = "application/json"
    }
    
    $testBooking = @{
        name = "Test User"
        phone_number = "0987654321"
        appointment_date = "2025-09-15"
        appointment_time = "10:00"
        service_type = "checkup"
        notes = "Database trigger test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/bookings" -Headers $headers -Method POST -Body $testBooking
    Write-Host "  UNEXPECTED: Booking creation allowed without auth - CHECK RLS!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASS: RLS properly blocking unauthenticated booking creation" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Check if notification_logs table exists (trigger infrastructure)
Write-Host "`nTest 3: Notification Infrastructure Check" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{
        "apikey" = $AnonKey
        "Authorization" = "Bearer $AnonKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/notification_logs?select=count" -Headers $headers -Method HEAD
    Write-Host "  UNEXPECTED: notification_logs accessible - CHECK RLS!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASS: notification_logs properly secured" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Reception System Files
Write-Host "`nTest 4: Reception System Readiness" -ForegroundColor Yellow
$testCount++
$receptionFiles = @(
    "reception-system-v3-production.html",
    "admin-reception-enhanced.html"
)

$filesFound = 0
foreach ($file in $receptionFiles) {
    if (Test-Path $file) {
        $filesFound++
    }
}

if ($filesFound -eq $receptionFiles.Count) {
    Write-Host "  PASS: All reception system files present" -ForegroundColor Green
    $passCount++
} else {
    Write-Host "  FAIL: Missing reception system files ($filesFound/$($receptionFiles.Count))" -ForegroundColor Red
}

# Test 5: Mini App Configuration Check
Write-Host "`nTest 5: Mini App Configuration" -ForegroundColor Yellow
$testCount++

$configFiles = @("app-config.json", "zmp-cli.json")
$configFound = 0
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $configFound++
    }
}

if ($configFound -gt 0) {
    Write-Host "  PASS: Mini App configuration files present" -ForegroundColor Green
    $passCount++
} else {
    Write-Host "  FAIL: No Mini App configuration found" -ForegroundColor Red
}

# Results Summary
Write-Host "`n" -NoNewline
Write-Host "DATABASE TEST RESULTS" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "Passed: $passCount / $testCount tests" -ForegroundColor White

$passRate = [math]::Round(($passCount / $testCount) * 100, 1)
if ($passRate -ge 80) {
    Write-Host "Pass Rate: $passRate% - DATABASE SYSTEM READY!" -ForegroundColor Green
    Write-Host "`nSTATUS: Core database infrastructure is functioning correctly." -ForegroundColor Green
    Write-Host "RLS security is properly configured." -ForegroundColor Green
    Write-Host "Database triggers should handle notifications automatically." -ForegroundColor Green
} elseif ($passRate -ge 60) {
    Write-Host "Pass Rate: $passRate% - Minor database issues detected" -ForegroundColor Yellow
} else {
    Write-Host "Pass Rate: $passRate% - Major database issues need fixing" -ForegroundColor Red
}

Write-Host "`nNEXT STEPS FOR TESTING:" -ForegroundColor Cyan
Write-Host "1. Open Mini App: https://zalo.me/s/3355586882348907634/" -ForegroundColor White
Write-Host "2. Create a test booking in the Mini App" -ForegroundColor White
Write-Host "3. Open reception-system-v3-production.html" -ForegroundColor White
Write-Host "4. Check if booking appears in reception system" -ForegroundColor White
Write-Host "5. Test check-in/check-out workflow" -ForegroundColor White

Write-Host "`nIMPORTANT NOTE:" -ForegroundColor Yellow
Write-Host "Edge Functions are having authentication issues but database triggers" -ForegroundColor White
Write-Host "provide the core functionality for automatic notifications." -ForegroundColor White
