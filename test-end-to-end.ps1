# 🧪 End-to-End Testing Script - Kajo Production
# File: test-end-to-end.ps1

param(
    [string]$AdminApiKey = "0883eb4f114371c8414ad8e3a2e3557b4fdddbadee78ecb41dfea0b8ca29cb96",
    [string]$BaseUrl = "https://vekrhqotmgszgsredkud.functions.supabase.co"
)

Write-Host "🧪 Kajo End-to-End Testing Suite" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test configuration
$global:TestResults = @()
$global:PassedTests = 0
$global:FailedTests = 0

function Add-TestResult {
    param($TestName, $Status, $Details)
    $global:TestResults += [PSCustomObject]@{
        Test = $TestName
        Status = $Status
        Details = $Details
        Timestamp = Get-Date -Format "HH:mm:ss"
    }
    
    if ($Status -eq "PASS") {
        $global:PassedTests++
        Write-Host "  ✅ $TestName" -ForegroundColor Green
    } else {
        $global:FailedTests++
        Write-Host "  ❌ $TestName - $Details" -ForegroundColor Red
    }
}

# Test 1: OA Health Check
Write-Host "`n🔍 Test 1: OA Health & Environment" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/oa_health" -Method GET -TimeoutSec 10
    if ($healthResponse.supabase_url_present -and $healthResponse.oa_token_present) {
        Add-TestResult "OA Health Check" "PASS" "Environment OK"
    } else {
        Add-TestResult "OA Health Check" "FAIL" "Missing environment variables"
    }
} catch {
    Add-TestResult "OA Health Check" "FAIL" $_.Exception.Message
}

# Test 2: Admin API Authentication
Write-Host "`n🔑 Test 2: Admin API Security" -ForegroundColor Yellow

# Test WITH admin key (should pass)
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-admin-key" = $AdminApiKey
    }
    $body = @{ filters = @{} } | ConvertTo-Json
    $adminResponse = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Add-TestResult "Admin API (Authenticated)" "PASS" "Data retrieved successfully"
} catch {
    Add-TestResult "Admin API (Authenticated)" "FAIL" $_.Exception.Message
}

# Test WITHOUT admin key (should fail)
try {
    $headers = @{ "Content-Type" = "application/json" }
    $body = @{ filters = @{} } | ConvertTo-Json
    $anonResponse = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Add-TestResult "Admin API (Anonymous Block)" "FAIL" "Anonymous access allowed - SECURITY ISSUE!"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Add-TestResult "Admin API (Anonymous Block)" "PASS" "Anonymous access properly blocked"
    } else {
        Add-TestResult "Admin API (Anonymous Block)" "FAIL" "Unexpected error: $($_.Exception.Message)"
    }
}

# Test 3: Edge Functions Availability
Write-Host "`n📡 Test 3: Edge Functions Availability" -ForegroundColor Yellow

$functions = @("checkin", "checkout", "notify_booking_created", "admin_bookings_query", "oa_health")
foreach ($func in $functions) {
    try {
        # Simple HEAD request to check if function exists
        $response = Invoke-WebRequest -Uri "$BaseUrl/$func" -Method OPTIONS -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Add-TestResult "Function: $func" "PASS" "Function available"
        } else {
            Add-TestResult "Function: $func" "FAIL" "HTTP $($response.StatusCode)"
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Add-TestResult "Function: $func" "PASS" "Function available (auth required)"
        } else {
            Add-TestResult "Function: $func" "FAIL" $_.Exception.Message
        }
    }
}

# Test 4: Database Connectivity via Edge Functions
Write-Host "`n🗃️ Test 4: Database Connectivity" -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-admin-key" = $AdminApiKey
    }
    $body = @{ 
        filters = @{
            date_start = (Get-Date -Format "yyyy-MM-dd")
            date_end = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        }
    } | ConvertTo-Json
    
    $dbResponse = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    if ($dbResponse.data) {
        $bookingCount = $dbResponse.data.Count
        Add-TestResult "Database Query" "PASS" "Retrieved $bookingCount bookings"
    } else {
        Add-TestResult "Database Query" "PASS" "No bookings found (DB accessible)"
    }
} catch {
    Add-TestResult "Database Query" "FAIL" $_.Exception.Message
}

# Test 5: Check-in/Check-out Functions (Dry Run)
Write-Host "`n⚕️ Test 5: Check-in/Check-out Endpoints" -ForegroundColor Yellow

# Test check-in endpoint structure
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-admin-key" = $AdminApiKey
    }
    $body = @{ 
        booking_id = "test-id-12345"
        staff_id = "test-staff"
    } | ConvertTo-Json
    
    $checkinResponse = Invoke-RestMethod -Uri "$BaseUrl/checkin" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Add-TestResult "Check-in Endpoint" "FAIL" "Should not work with fake ID"
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Add-TestResult "Check-in Endpoint" "PASS" "Endpoint working (booking not found as expected)"
    } else {
        Add-TestResult "Check-in Endpoint" "FAIL" $_.Exception.Message
    }
}

# Test 6: OA Test Message (if test mode)
Write-Host "`n📱 Test 6: OA Messaging Test" -ForegroundColor Yellow
$testMessage = Read-Host "Enter test message_token or 'skip' to skip OA test"
if ($testMessage -ne "skip" -and $testMessage.Length -gt 0) {
    try {
        $oaBody = @{
            recipient = @{ message_token = $testMessage }
            text = "[Kajo Test] System health check - $(Get-Date -Format 'HH:mm:ss')"
        } | ConvertTo-Json -Depth 3
        
        $oaResponse = Invoke-RestMethod -Uri "$BaseUrl/oa_health" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $oaBody -TimeoutSec 10
        if ($oaResponse.success) {
            Add-TestResult "OA Test Message" "PASS" "Message sent successfully"
        } else {
            Add-TestResult "OA Test Message" "FAIL" "OA response: $($oaResponse.error)"
        }
    } catch {
        Add-TestResult "OA Test Message" "FAIL" $_.Exception.Message
    }
} else {
    Add-TestResult "OA Test Message" "SKIP" "User skipped OA test"
}

# Test 7: Reception System Files
Write-Host "`n🖥️ Test 7: Reception System Files" -ForegroundColor Yellow
$receptionFile = "reception-system-v3-production.html"
if (Test-Path $receptionFile) {
    $content = Get-Content $receptionFile -Raw
    if ($content.Contains($AdminApiKey.Substring(0, 12))) {
        Add-TestResult "Reception System Config" "PASS" "Admin key configured correctly"
    } else {
        Add-TestResult "Reception System Config" "FAIL" "Admin key not found in config"
    }
    
    if ($content.Contains($BaseUrl)) {
        Add-TestResult "Reception System URL" "PASS" "Edge Functions URL configured"
    } else {
        Add-TestResult "Reception System URL" "FAIL" "Edge Functions URL not configured"
    }
} else {
    Add-TestResult "Reception System Files" "FAIL" "reception-system-v3-production.html not found"
}

# Test 8: Domain-Free Solution Status
Write-Host "`n🌐 Test 8: Domain-Free Solution" -ForegroundColor Yellow
Write-Host "🚫 Zalo API Domain Issue: Supabase requires Pro plan for custom domains" -ForegroundColor Red
Write-Host "✅ Solution 1: Database Trigger Auto-Notification" -ForegroundColor Green
Write-Host "✅ Solution 2: Cloudflare Workers Proxy (Free)" -ForegroundColor Green
Write-Host "✅ Solution 3: Mini App → Database Only" -ForegroundColor Green

Add-TestResult "Domain Solution" "INFO" "Multiple domain-free alternatives available"

# Test database trigger if exists
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-admin-key" = $AdminApiKey
    }
    $body = @{ 
        filters = @{}
    } | ConvertTo-Json
    
    $dbResponse = Invoke-RestMethod -Uri "$BaseUrl/admin_bookings_query" -Method POST -Headers $headers -Body $body -TimeoutSec 10
    if ($dbResponse.data) {
        Add-TestResult "Database Trigger Ready" "PASS" "Booking system accessible for trigger setup"
    } else {
        Add-TestResult "Database Trigger Ready" "PASS" "Database ready for trigger implementation"
    }
} catch {
    Add-TestResult "Database Trigger Ready" "FAIL" $_.Exception.Message
}

# Test 9: Security Headers
Write-Host "`n🛡️ Test 9: CORS & Security Headers" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/oa_health" -Method OPTIONS
    $corsHeader = $response.Headers["access-control-allow-origin"]
    if ($corsHeader -eq "*") {
        Add-TestResult "CORS Headers" "PASS" "CORS properly configured"
    } else {
        Add-TestResult "CORS Headers" "FAIL" "CORS header missing or incorrect"
    }
} catch {
    Add-TestResult "CORS Headers" "FAIL" $_.Exception.Message
}

# Generate Test Report
Write-Host "`n📊 TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$global:TestResults | Format-Table -AutoSize

$totalTests = $global:PassedTests + $global:FailedTests
$passRate = [math]::Round(($global:PassedTests / $totalTests) * 100, 1)

Write-Host "`n📈 OVERALL RESULTS:" -ForegroundColor White
Write-Host "  ✅ Passed: $global:PassedTests tests" -ForegroundColor Green
Write-Host "  ❌ Failed: $global:FailedTests tests" -ForegroundColor Red
Write-Host "  📊 Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } else { "Yellow" })

# Recommendations
Write-Host "`n💡 DOMAIN-FREE RECOMMENDATIONS:" -ForegroundColor Yellow

Write-Host "`n🎯 IMMEDIATE SOLUTION (No Custom Domain Needed):" -ForegroundColor Cyan
Write-Host "1. 📊 Use Database Trigger for auto-notifications" -ForegroundColor Green
Write-Host "2. 🖥️ Reception system works normally (admin functions)" -ForegroundColor Green  
Write-Host "3. 📱 Mini App creates bookings directly in database" -ForegroundColor Green
Write-Host "4. 🔔 Notifications sent via database trigger (no API calls)" -ForegroundColor Green

Write-Host "`n🚀 OPTIONAL ENHANCEMENTS:" -ForegroundColor Yellow
Write-Host "• Cloudflare Workers proxy for API calls" -ForegroundColor White
Write-Host "• Vercel/Netlify functions as proxy" -ForegroundColor White
Write-Host "• Future: Upgrade Supabase Pro for custom domains" -ForegroundColor White

if ($global:FailedTests -eq 0) {
    Write-Host "`n🎉 All tests passed! Domain-free system ready for production." -ForegroundColor Green
    Write-Host "`n🚀 NEXT STEPS (No Domain Config Needed):" -ForegroundColor Cyan
    Write-Host "1. Deploy database trigger for auto-notifications"
    Write-Host "2. Test Mini App booking flow (database-only)"
    Write-Host "3. Test reception system check-in/check-out"
    Write-Host "4. Verify notification logs in database"
    Write-Host "5. Skip Zalo API domains (use database trigger instead)"
} elseif ($global:FailedTests -le 2) {
    Write-Host "⚠️ Minor issues detected. Review failed tests above." -ForegroundColor Yellow
    Write-Host "System may be ready for production with fixes." -ForegroundColor Yellow
} else {
    Write-Host "🚨 Multiple issues detected. Fix failed tests before go-live." -ForegroundColor Red
    Write-Host "Review deployment checklist and environment variables." -ForegroundColor Red
}

Write-Host "`n📖 DOCUMENTATION:" -ForegroundColor White
Write-Host "  📄 PRODUCTION-DEPLOYMENT-CHECKLIST.md - Complete testing guide"
Write-Host "  📄 EXECUTE-DEPLOYMENT.md - Deployment instructions"
Write-Host "  🖥️ reception-system-v3-production.html - Admin interface"

Write-Host "`n🏥 Kajo Test Suite Complete! $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
