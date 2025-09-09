# Update Supabase Environment Variables with New Zalo Token
# This script will update the ZALO_ACCESS_TOKEN in your Supabase project

Write-Host "🔧 SUPABASE ENVIRONMENT VARIABLES UPDATE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Your new access token (provided by user)
$newAccessToken = "w_1P3ciGhIFfzLS3OHAaAk3qKG1W2VarjuL_I3y7voJ2k5D46rlXRk7-R1mN6VHSwgK55ciqeasUZoGNNpQyHQQ82GzaTgXFdUO1FbbVh7EpkoXJLZkF9xVSFrWtIPa1rQ8eV0ufdYtdjIrs0Is75FYD1qal7AuEgPOpGc0QasE2coKJGYgNKvsgEWGUGQTQmjSs93X3WNgwvp0WEqwNUyhR8riLGO8Q_C4sL1C_hXdjZorgEHs01_gADrmp79OIv8WjJsPYbcIYvoLHN4ALBAZUOKqkOvGZ_TuX21rlaq7r-2K6AcMqHEti11KEKerWY-atJrKCiGsHvZj3OtUA79tqSM5C5i4ljRz9Nr8PwIMllbv4RY7l1ekQU6HkVSeIWPzCLLW8_Zh5kWWGEYxyGl-IHWqE4xLIiDF266yDgI8"

Write-Host "🎯 New Access Token:" -ForegroundColor Yellow
Write-Host $newAccessToken -ForegroundColor Cyan

Write-Host "`n📋 Required Environment Variables:" -ForegroundColor Yellow
Write-Host "ZALO_ACCESS_TOKEN=" -NoNewline -ForegroundColor White
Write-Host $newAccessToken -ForegroundColor Green
Write-Host "ZALO_APP_ID=4291763606161179100" -ForegroundColor White
Write-Host "ZALO_OA_ID=1932356441029769129" -ForegroundColor White

Write-Host "`n🔗 Supabase Dashboard URL:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/vekrhqotmgszgsredkud/settings/environment-variables" -ForegroundColor Cyan

Write-Host "`n📝 Manual Update Steps:" -ForegroundColor Yellow
Write-Host "1. Open the Supabase dashboard URL above" -ForegroundColor White
Write-Host "2. Find 'ZALO_ACCESS_TOKEN' variable" -ForegroundColor White
Write-Host "3. Update its value with the new token shown above" -ForegroundColor White
Write-Host "4. Save the changes" -ForegroundColor White

# Try to update via Supabase CLI (if available)
Write-Host "`n🤖 Attempting automatic update via Supabase CLI..." -ForegroundColor Yellow

if (Get-Command "supabase" -ErrorAction SilentlyContinue) {
    try {
        Write-Host "Setting ZALO_ACCESS_TOKEN..." -ForegroundColor White
        $result = supabase secrets set ZALO_ACCESS_TOKEN="$newAccessToken" --project-ref vekrhqotmgszgsredkud 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ ZALO_ACCESS_TOKEN updated successfully via CLI!" -ForegroundColor Green
        } else {
            Write-Host "❌ CLI update failed: $result" -ForegroundColor Red
            Write-Host "💡 Please update manually using the dashboard URL above" -ForegroundColor Yellow
        }
        
        Write-Host "Setting ZALO_APP_ID..." -ForegroundColor White
        supabase secrets set ZALO_APP_ID="4291763606161179100" --project-ref vekrhqotmgszgsredkud
        
        Write-Host "Setting ZALO_OA_ID..." -ForegroundColor White  
        supabase secrets set ZALO_OA_ID="1932356441029769129" --project-ref vekrhqotmgszgsredkud
        
        Write-Host "✅ All Zalo environment variables updated!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ CLI update failed: $_" -ForegroundColor Red
        Write-Host "💡 Please update manually using the dashboard URL above" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Supabase CLI not found. Please update manually." -ForegroundColor Blue
    Write-Host "Or run: ./deploy-edge-functions.ps1 first to install CLI" -ForegroundColor White
}

Write-Host "`n🧪 Testing Token Validity..." -ForegroundColor Yellow

# Test the new token
$testUri = "https://openapi.zalo.me/v2.0/oa/info"
$testHeaders = @{
    "access_token" = $newAccessToken
}

try {
    $response = Invoke-RestMethod -Uri $testUri -Method GET -Headers $testHeaders
    if ($response.error -eq 0) {
        Write-Host "✅ Token is valid! OA Name: $($response.data.name)" -ForegroundColor Green
    } else {
        Write-Host "❌ Token test failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Token test error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. ✅ Token updated (if CLI worked) or update manually" -ForegroundColor White
Write-Host "2. 🚀 Run: ./deploy-edge-functions.ps1" -ForegroundColor White
Write-Host "3. 🧪 Test admin system: reception-system.html" -ForegroundColor White
Write-Host "4. 📱 Test OA notifications" -ForegroundColor White

Write-Host "`n✅ Environment update completed!" -ForegroundColor Green

pause
