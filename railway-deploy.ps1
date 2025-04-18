# Railway Deployment PowerShell Script

# Check if token is provided as argument
param(
    [Parameter(Mandatory=$true)]
    [string]$token
)

# Login to Railway
Write-Host "Logging in to Railway..."
railway login --token $token

# Create a new project
Write-Host "Creating a new project..."
railway init --name marden-audit

# Set up Redis service
Write-Host "Adding Redis service..."
railway add --plugin redis

# Deploy backend service
Write-Host "Setting up backend service..."
cd backend
railway up
cd ..

# Deploy frontend service
Write-Host "Setting up frontend service..."
cd frontend
railway up
cd ..

# Create a domain for the frontend
Write-Host "Setting up domain for frontend..."
railway domain

# Show project status
Write-Host "Deployment completed. Here's your project status:"
railway status

Write-Host "Your deployment is now complete!"
