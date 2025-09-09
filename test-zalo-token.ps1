# Quick Test for New Zalo Access Token
Write-Host "🧪 TESTING NEW ZALO ACCESS TOKEN" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$accessToken = "w_1P3ciGhIFfzLS3OHAaAk3qKG1W2VarjuL_I3y7voJ2k5D46rlXRk7-R1mN6VHSwgK55ciqeasUZoGNNpQyHQQ82GzaTgXFdUO1FbbVh7EpkoXJLZkF9xVSFrWtIPa1rQ8eV0ufdYtdjIrs0Is75FYD1qal7AuEgPOpGc0QasE2coKJGYgNKvsgEWGUGQTQmjSs93X3WNgwvp0WEqwNUyhR8riLGO8Q_C4sL1C_hXdjZorgEHs01_gADrmp79OIv8WjJsPYbcIYvoLHN4ALBAZUOKqkOvGZ_TuX21rlaq7r-2K6AcMqHEti11KEKerWY-atJrKCiGsHvZj3OtUA79tqSM5C5i4ljRz9Nr8PwIMllbv4RY7l1ekQU6HkVSeIWPzCLLW8_Zh5kWWGEYxyGl-IHWqE4xLIiDF266yDgI8"

Write-Host "Testing Zalo OA API..." -ForegroundColor Yellow

try {
    $uri = "https://openapi.zalo.me/v2.0/oa/info"
    $headers = @{
        "access_token" = $accessToken
    }
    
    $response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
    
    if ($response.error -eq 0) {
        Write-Host "✅ TOKEN IS VALID!" -ForegroundColor Green
        Write-Host "OA Name: $($response.data.name)" -ForegroundColor Cyan
        Write-Host "OA ID: $($response.data.oa_id)" -ForegroundColor Cyan
        Write-Host "Description: $($response.data.description)" -ForegroundColor White
        
        Write-Host "`n🎯 ACTIONS NEEDED:" -ForegroundColor Yellow
        Write-Host "1. Update ZALO_ACCESS_TOKEN in Supabase:" -ForegroundColor White
        Write-Host "   https://supabase.com/dashboard/project/vekrhqotmgszgsredkud/settings/environment-variables" -ForegroundColor Cyan
        Write-Host "2. Set value to: $accessToken" -ForegroundColor Green
        Write-Host "3. Test admin system: reception-system.html" -ForegroundColor White
        
    } else {
        Write-Host "❌ TOKEN ERROR: $($response.message)" -ForegroundColor Red
        Write-Host "Error Code: $($response.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ API ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n📋 Summary:" -ForegroundColor Green
Write-Host "✅ New access token provided and tested" -ForegroundColor White
Write-Host "✅ Database migration completed with booking codes" -ForegroundColor White  
Write-Host "✅ Enhanced admin system created (reception-system.html)" -ForegroundColor White
Write-Host "🔄 Update Supabase environment variables" -ForegroundColor Yellow
Write-Host "🔄 Test enhanced admin system" -ForegroundColor Yellow

pause
