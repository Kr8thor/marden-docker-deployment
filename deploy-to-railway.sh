#!/bin/bash

# Railway Deployment Bash Script

# Check if RAILWAY_TOKEN is set
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "Error: RAILWAY_TOKEN environment variable is required"
    echo "Please set it with: export RAILWAY_TOKEN='your-token'"
    exit 1
fi

echo "Starting deployment to Railway..."

# Deploy backend service
echo "Deploying backend service..."
cd backend
railway up --detach
backendServiceId=$(railway service)

# Set environment variables for backend
echo "Setting backend environment variables..."
railway variables --set "NODE_ENV=production" \
                  --set "REDIS_URL=redis://default:AVOLAAIjcDFmNzVjNDVjZGM3MGY0NDczODEyMTA0NTAyOGNkMTc5OXAxMA@smiling-shrimp-21387.upstash.io:6379"

# Deploy frontend service
echo "Deploying frontend service..."
cd ../frontend
railway up --detach
frontendServiceId=$(railway service)

# Set environment variables for frontend
echo "Setting frontend environment variables..."
railway variables --set "NODE_ENV=production" \
                  --set "VITE_API_URL=https://audit.mardenseo.com/api"

# Add custom domain to frontend service
echo "Setting up custom domain for frontend service..."
railway domain add audit.mardenseo.com

echo "Deployment completed!"
echo "Please follow the Railway DNS configuration instructions to complete the custom domain setup."
