# Railway Deployment PowerShell Script

# Check if RAILWAY_TOKEN is set
if (-not $env:RAILWAY_TOKEN) {
    Write-Host "Error: RAILWAY_TOKEN environment variable is required" -ForegroundColor Red
    Write-Host "Please set it with: $env:RAILWAY_TOKEN = 'your-token'"
    exit 1
}

Write-Host "Starting deployment to Railway..." -ForegroundColor Green

# Deploy backend service
Write-Host "Deploying backend service..." -ForegroundColor Cyan
Set-Location backend
railway up --detach
$backendServiceId = railway service

# Set environment variables for backend
Write-Host "Setting backend environment variables..." -ForegroundColor Cyan
railway variables --set "NODE_ENV=production" `
                  --set "REDIS_URL=redis://default:AVOLAAIjcDFmNzVjNDVjZGM3MGY0NDczODEyMTA0NTAyOGNkMTc5OXAxMA@smiling-shrimp-21387.upstash.io:6379"

# Deploy frontend service
Write-Host "Deploying frontend service..." -ForegroundColor Cyan
Set-Location ../frontend
railway up --detach
$frontendServiceId = railway service

# Set environment variables for frontend
Write-Host "Setting frontend environment variables..." -ForegroundColor Cyan
railway variables --set "NODE_ENV=production" `
                  --set "VITE_API_URL=https://audit.mardenseo.com/api"

# Add custom domain to frontend service
Write-Host "Setting up custom domain for frontend service..." -ForegroundColor Cyan
railway domain add audit.mardenseo.com

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Please follow the Railway DNS configuration instructions to complete the custom domain setup."
