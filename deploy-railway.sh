#!/bin/bash

# Prepare for Railway deployment
cp frontend/Dockerfile.railway frontend/Dockerfile
cp frontend/nginx.railway.conf frontend/nginx.conf
cp backend/Dockerfile.railway backend/Dockerfile
cp docker-compose.railway.yml docker-compose.yml

# Push changes to GitHub
git add .
git commit -m "Prepare for Railway deployment"
git push origin main

# Instructions for Railway deployment
echo "========================================================================"
echo "Changes committed and pushed to GitHub."
echo "Now go to https://railway.app to deploy your application:"
echo ""
echo "1. Create a new project by clicking 'New Project'"
echo "2. Select 'Deploy from GitHub repo'"
echo "3. Choose your Kr8thor/marden-docker-deployment repo"
echo "4. Add a Redis service from the 'New Service' button"
echo "5. Link the Redis service to both frontend and backend services"
echo "6. Set up custom domains in the Railway dashboard"
echo "========================================================================"