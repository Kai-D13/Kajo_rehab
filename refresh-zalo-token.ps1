# Zalo OA Token Refresh Script
# This script will refresh your expired Zalo access token

Write-Host "🔄 ZALO OA ACCESS TOKEN REFRESH" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Your refresh token (latest from user)
$refreshToken = "o4TJ7jYrEo3AGbqJqhSoASD3Mn3Jh3TndoKVJzAFAJM71mLKwOzl1_eUV46YhLS9rWLCPAQb8pdsEnDMlxGfR-uc1ZkVYWW2-WuKUuYxBJ7x0Z9xihigDT0l5dALjn5Dpn0Y4gA6JYcq655ftfjYCB8P3LFdYsKCi39iNyUwGWsp2cXWsfzw6vuR5Ntmc2rEwJD16e6vIsJA6Naad-58JFnrGJsPu2Pwz4uxEAUz4cVjFGKZXQbZRfSUNmR1jNP5q4DHAwR7FaFYIIr-fjyU0CvI13BR-c91atX6VzdxG02RR45KpzKjBwbMFsVuv28RiqeI9iJbFngKPJ4fm-8DOPT7PXpUycTMhmDFACINQKsb6rv-mvbrCeys6bpOdZGHrGi_OyIwDZsKDaLosfDQ3Oi_HqHfBI31NWlSg3yX"

Write-Host "Current Refresh Token:" -ForegroundColor Yellow
Write-Host $refreshToken -ForegroundColor White

Write-Host "`n🔐 Attempting to refresh access token..." -ForegroundColor Yellow

# Prepare the API request
$uri = "https://oauth.zaloapp.com/v4/oa/access_token"
$headers = @{
    "Content-Type" = "application/x-www-form-urlencoded"
}
$body = @{
    "refresh_token" = $refreshToken
    "app_id" = "4291763606161179100"
    "grant_type" = "refresh_token"
}

try {
    Write-Host "Making API request to Zalo..." -ForegroundColor White
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    
    if ($response.access_token) {
        Write-Host "`n✅ SUCCESS! New access token obtained:" -ForegroundColor Green
        Write-Host $response.access_token -ForegroundColor Cyan
        
        if ($response.refresh_token) {
            Write-Host "`n🔄 New refresh token:" -ForegroundColor Yellow
            Write-Host $response.refresh_token -ForegroundColor Cyan
        }
        
        Write-Host "`n📋 Token expires in: $($response.expires_in) seconds" -ForegroundColor White
        
        # Save tokens to a file for easy access
        $tokenData = @{
            access_token = $response.access_token
            refresh_token = $response.refresh_token
            expires_in = $response.expires_in
            obtained_at = Get-Date
        }
        
        $tokenData | ConvertTo-Json | Out-File -FilePath "zalo-tokens.json" -Encoding UTF8
        Write-Host "💾 Tokens saved to zalo-tokens.json" -ForegroundColor Green
        
        Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
        Write-Host "1. Update ZALO_ACCESS_TOKEN in Supabase dashboard:" -ForegroundColor White
        Write-Host "   https://supabase.com/dashboard/project/vekrhqotmgszgsredkud/settings/environment-variables" -ForegroundColor Cyan
        Write-Host "2. Set the new access token value above" -ForegroundColor White
        Write-Host "3. Test the OA notifications in your admin system" -ForegroundColor White
        
    } else {
        Write-Host "❌ No access token in response" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Failed to refresh token:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n💡 Remember:" -ForegroundColor Yellow
Write-Host "- Access tokens expire every 24 hours" -ForegroundColor White
Write-Host "- Save the new refresh token for future use" -ForegroundColor White
Write-Host "- Update your Supabase environment variables" -ForegroundColor White

pause
