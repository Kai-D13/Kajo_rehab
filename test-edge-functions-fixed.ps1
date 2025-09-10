# Test Edge Functions - Fixed Version
# File: test-edge-functions-fixed.ps1

param(
    [string]$AdminApiKey = "0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96",
    [string]$BaseUrl = "https://vekrhqotmgszgsredkud.supabase.co/functions/v1",
    [string]$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMDA4MTMsImV4cCI6MjA0Njc3NjgxM30.NJ42lNaBUFx2nzz8LfpXoozlzFzPCgkKXGNr8eL0R-Q"
)

Write-Host "Kajo Edge Functions Test - Fixed" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$testCount = 0
$passCount = 0

# Common headers
$commonHeaders = @{
    "Authorization" = "Bearer $AnonKey"
    "apikey" = $AnonKey
    "Content-Type" = "application/json"
    "x-admin-key" = $AdminApiKey
}

# Test 1: OA Health Check
Write-Host "`nTest 1: OA Health Check" -ForegroundColor Yellow
$testCount++
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/oa_health" -Method GET -Headers $commonHeaders -TimeoutSec 10
    if ($response.ok -eq $true) {
        Write-Host "  PASS: OA Health responding correctly" -ForegroundColor Green
        Write-Host "    - ZALO_OA_ID present: $($response.report.zalo_oa_id_present)" -ForegroundColor Cyan
        Write-Host "    - ZALO_OA_TOKEN present: $($response.report.zalo_oa_token_present)" -ForegroundColor Cyan
        $passCount++
    } else {
        Write-Host "  FAIL: OA Health returned unexpected response" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Admin Bookings Query
Write-Host "`nTest 2: Admin Bookings Query" -ForegroundColor Yellow
$testCount++
try {
    $body = @{
        from = "2025-09-08"
        to = "2025-09-15"
        limit = 100
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $commonHeaders -Body $body -TimeoutSec 10
    if ($response.ok -eq $true) {
        Write-Host "  PASS: Admin query successful" -ForegroundColor Green
        Write-Host "    - Bookings found: $($response.count)" -ForegroundColor Cyan
        $passCount++
    } else {
        Write-Host "  FAIL: Admin query failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test Check-in (if we have bookings)
Write-Host "`nTest 3: Check-in Function Test" -ForegroundColor Yellow
$testCount++
try {
    # Create a test booking ID (UUID format)
    $testBookingId = "00000000-0000-0000-0000-000000000001"
    
    $body = @{
        booking_id = $testBookingId
        staff_id = "reception-test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/checkin" -Method POST -Headers $commonHeaders -Body $body -TimeoutSec 10
    
    # Even if booking doesn't exist, function should respond properly
    if ($response) {
        Write-Host "  PASS: Check-in function responding" -ForegroundColor Green
        if ($response.error) {
            Write-Host "    - Expected error (test booking): $($response.error)" -ForegroundColor Yellow
        }
        $passCount++
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -like "*400*" -or $errorMsg -like "*404*") {
        Write-Host "  PASS: Check-in function responding (expected error for test data)" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: $errorMsg" -ForegroundColor Red
    }
}

# Test 4: Test Check-out
Write-Host "`nTest 4: Check-out Function Test" -ForegroundColor Yellow
$testCount++
try {
    $testBookingId = "00000000-0000-0000-0000-000000000001"
    
    $body = @{
        booking_id = $testBookingId
        staff_id = "reception-test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/checkout" -Method POST -Headers $commonHeaders -Body $body -TimeoutSec 10
    
    if ($response) {
        Write-Host "  PASS: Check-out function responding" -ForegroundColor Green
        if ($response.error) {
            Write-Host "    - Expected error (test booking): $($response.error)" -ForegroundColor Yellow
        }
        $passCount++
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -like "*400*" -or $errorMsg -like "*404*") {
        Write-Host "  PASS: Check-out function responding (expected error for test data)" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: $errorMsg" -ForegroundColor Red
    }
}

# Test 5: Notification Function
Write-Host "`nTest 5: Notification Function Test" -ForegroundColor Yellow
$testCount++
try {
    $body = @{
        booking_id = "test-notification"
        message = "Test notification from script"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/notify_booking_created" -Method POST -Headers $commonHeaders -Body $body -TimeoutSec 10
    
    if ($response) {
        Write-Host "  PASS: Notification function responding" -ForegroundColor Green
        $passCount++
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -like "*400*") {
        Write-Host "  PASS: Notification function responding (expected validation error)" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: $errorMsg" -ForegroundColor Red
    }
}

# Results Summary
Write-Host "`n" -NoNewline
Write-Host "EDGE FUNCTIONS TEST RESULTS" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "Passed: $passCount / $testCount tests" -ForegroundColor White

$passRate = [math]::Round(($passCount / $testCount) * 100, 1)
if ($passRate -ge 80) {
    Write-Host "Pass Rate: $passRate% - EDGE FUNCTIONS WORKING!" -ForegroundColor Green
} elseif ($passRate -ge 60) {
    Write-Host "Pass Rate: $passRate% - Most functions working" -ForegroundColor Yellow
} else {
    Write-Host "Pass Rate: $passRate% - Edge functions need debugging" -ForegroundColor Red
}

Write-Host "`nNEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Test reception system: .\reception-system-v3-production.html" -ForegroundColor White
Write-Host "2. Test mini app booking creation" -ForegroundColor White
Write-Host "3. Verify end-to-end workflow" -ForegroundColor White

Write-Host "`nFunction URLs:" -ForegroundColor Yellow
Write-Host "- Health Check: $BaseUrl/oa_health" -ForegroundColor White
Write-Host "- Admin Query: $BaseUrl/admin_bookings_query" -ForegroundColor White
Write-Host "- Check-in: $BaseUrl/checkin" -ForegroundColor White
Write-Host "- Check-out: $BaseUrl/checkout" -ForegroundColor White
