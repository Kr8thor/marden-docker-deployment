#!/bin/bash

# Check if token is provided as argument
if [ -z "$1" ]; then
  echo "Error: Railway API token is required"
  echo "Usage: ./railway-deploy.sh <RAILWAY_TOKEN>"
  exit 1
fi

TOKEN=$1

# Login to Railway
echo "Logging in to Railway..."
railway login --token $TOKEN

# Create a new project
echo "Creating a new project..."
railway init --name marden-audit

# Set up Redis service
echo "Adding Redis service..."
railway add --plugin redis

# Deploy backend service
echo "Setting up backend service..."
cd backend
railway up
cd ..

# Deploy frontend service
echo "Setting up frontend service..."
cd frontend
railway up
cd ..

# Create a domain for the frontend
echo "Setting up domain for frontend..."
railway domain

# Show project status
echo "Deployment completed. Here's your project status:"
railway status

echo "Your deployment is now complete!"
