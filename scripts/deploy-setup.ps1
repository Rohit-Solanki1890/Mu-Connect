<#
PowerShell helper to set Render environment variables and trigger a redeploy.

USAGE (interactive):
  1. Open PowerShell, run: .\scripts\deploy-setup.ps1
  2. Provide your Render API key and Service ID when prompted.

WARNING: This script calls the Render API with your API key. Keep your key safe.
#>

param()

function Read-Secret($prompt) {
    Write-Host -NoNewline ($prompt + ': ') -ForegroundColor Yellow
    $sec = Read-Host -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

Write-Host "This script will set Render env vars (CLIENT_URLS, CLIENT_PATTERNS, DEBUG_CORS) and trigger a redeploy." -ForegroundColor Cyan
$renderApiKey = Read-Secret "Enter your Render API Key (starts with RND)"
$serviceId = Read-Host "Enter your Render Service ID (e.g. srv-xxxx)"

# Prompt for values
$clientUrls = Read-Host "Enter CLIENT_URLS (comma-separated exact domains) or leave blank"
$clientPatterns = Read-Host "Enter CLIENT_PATTERNS (comma-separated regex) or leave blank (example: ^https:\/\/muconnect-.*\\.vercel\\.app$)"
$debug = Read-Host "Enable DEBUG_CORS? (true/false). Recommended temporarily: true"

# Helper to create env var
function Create-EnvVar($key, $value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return }
    $body = @{ key = $key; value = $value; category = "env" } | ConvertTo-Json
    $url = "https://api.render.com/v1/services/$serviceId/env-vars"
    Write-Host "Creating env var $key..."
    $resp = Invoke-RestMethod -Method Post -Uri $url -Headers @{ "Accept" = "application/json"; "Authorization" = "Bearer $renderApiKey" } -Body $body -ContentType "application/json"
    Write-Host ("Created: {0}" -f ($resp | ConvertTo-Json -Depth 2)) -ForegroundColor Green
}

# Execute
try {
    if ($clientUrls) { Create-EnvVar -key "CLIENT_URLS" -value $clientUrls }
    if ($clientPatterns) { Create-EnvVar -key "CLIENT_PATTERNS" -value $clientPatterns }
    if ($debug) { Create-EnvVar -key "DEBUG_CORS" -value $debug }

    Write-Host "Triggering a new deploy..." -ForegroundColor Cyan
    $deployUrl = "https://api.render.com/v1/services/$serviceId/deploys"
    $deployResp = Invoke-RestMethod -Method Post -Uri $deployUrl -Headers @{ "Accept" = "application/json"; "Authorization" = "Bearer $renderApiKey" } -Body '{}' -ContentType "application/json"
    Write-Host "Deploy triggered. Deploy ID: $($deployResp.id)" -ForegroundColor Green
    Write-Host "You can view the deploy in the Render dashboard. Wait for the deploy to finish, then redeploy the frontend on Vercel." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "\nNext: set Vercel env VITE_API_URL to https://mu-connect-backend.onrender.com (no trailing slash) and redeploy the frontend (clear build cache)." -ForegroundColor Yellow
Write-Host "Vercel CLI command example (interactive): vercel env add VITE_API_URL production" -ForegroundColor Gray
Write-Host "Or set it in the Vercel dashboard (Project -> Settings -> Environment Variables)." -ForegroundColor Gray

Write-Host "Script finished." -ForegroundColor Green
