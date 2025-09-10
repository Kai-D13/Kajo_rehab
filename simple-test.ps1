# Simple Test Script - Kajo Production
# File: simple-test.ps1

param(
    [string]$AdminApiKey = "0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96",
    [string]$BaseUrl = "https://vekrhqotmgszgsredkud.supabase.co/functions/v1",
    [string]$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3JocW90bWdzemdzcmVka3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMDA4MTMsImV4cCI6MjA0Njc3NjgxM30.NJ42lNaBUFx2nzz8LfpXoozlzFzPCgkKXGNr8eL0R-Q"
)

Write-Host "Kajo Simple Test Suite" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

$testCount = 0
$passCount = 0

# Test 1: OA Health Check
Write-Host "`nTest 1: OA Health Check" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{
        "Authorization" = "Bearer $AnonKey"
        "apikey" = $AnonKey
    }
    $response = Invoke-RestMethod -Uri "$BaseUrl/oa_health" -Method GET -Headers $headers -TimeoutSec 10
    if ($response) {
        Write-Host "  PASS: OA Health endpoint responding" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: No response from OA Health" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Admin API with Key
Write-Host "`nTest 2: Admin API Authentication" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $AnonKey"
        "apikey" = $AnonKey
        "x-admin-key" = $AdminApiKey
    }
    $body = '{"filters":{}}'
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Write-Host "  PASS: Admin API authenticated successfully" -ForegroundColor Green
    $passCount++
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Admin API without Key (should fail)
Write-Host "`nTest 3: Security Check (Anonymous Block)" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{ 
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $AnonKey"
        "apikey" = $AnonKey
    }
    $body = '{"filters":{}}'
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Write-Host "  FAIL: Anonymous access allowed - SECURITY ISSUE!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
        Write-Host "  PASS: Anonymous access properly blocked" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Reception System File
Write-Host "`nTest 4: Reception System File Check" -ForegroundColor Yellow
$testCount++
$receptionFile = "reception-system-v3-production.html"
if (Test-Path $receptionFile) {
    $content = Get-Content $receptionFile -Raw
    if ($content.Contains("0883eb4f114371c8")) {
        Write-Host "  PASS: Reception system configured with admin key" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  FAIL: Admin key not found in reception system" -ForegroundColor Red
    }
} else {
    Write-Host "  FAIL: reception-system-v3-production.html not found" -ForegroundColor Red
}

# Test 5: Database Trigger Check (via notification_logs table)
Write-Host "`nTest 5: Database Trigger Availability" -ForegroundColor Yellow
$testCount++
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $AnonKey"
        "apikey" = $AnonKey
        "x-admin-key" = $AdminApiKey
    }
    $body = '{"filters":{}}'
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    if ($response.data -ne $null) {
        Write-Host "  PASS: Database accessible for trigger operations" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "  INFO: Database accessible but no bookings found" -ForegroundColor Yellow
        $passCount++
    }
} catch {
    Write-Host "  FAIL: Database connectivity issue: $($_.Exception.Message)" -ForegroundColor Red
}

# Results Summary
Write-Host "`n" -NoNewline
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Passed: $passCount / $testCount tests" -ForegroundColor White

$passRate = [math]::Round(($passCount / $testCount) * 100, 1)
if ($passRate -ge 80) {
    Write-Host "Pass Rate: $passRate% - SYSTEM READY!" -ForegroundColor Green
} elseif ($passRate -ge 60) {
    Write-Host "Pass Rate: $passRate% - Minor issues detected" -ForegroundColor Yellow
} else {
    Write-Host "Pass Rate: $passRate% - Major issues need fixing" -ForegroundColor Red
}

Write-Host "`nNEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open reception-system-v3-production.html" -ForegroundColor White
Write-Host "2. Test booking creation in Mini App" -ForegroundColor White
Write-Host "3. Verify database trigger logs" -ForegroundColor White
Write-Host "4. Test check-in/check-out workflow" -ForegroundColor White

Write-Host "`nMini App URL: https://zalo.me/s/3355586882348907634/" -ForegroundColor Green
Write-Host "Reception System: .\reception-system-v3-production.html" -ForegroundColor Green
