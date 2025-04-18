# Railway Deployment Guide

This guide outlines how to deploy the Marden SEO Audit application to Railway.

## Prerequisites

- A Railway account
- Access to the Redis service you've already set up (as shown in the screenshot)

## Deployment Steps

### 1. Deploy Backend Service

1. Go to your [Railway dashboard](https://railway.app/dashboard)
2. In your project with the Redis service, click "New Service"
3. Select "GitHub Repo"
4. Choose the "Kr8thor/marden-docker-deployment" repository
5. In the "Settings" tab:
   - Set the root directory to `/backend`
   - Set the main branch to `main`
6. In the "Variables" tab:
   - Add a reference to your Redis service by clicking on "Add from service" and selecting Redis
   - Ensure the `REDIS_URL` variable is correctly linked
   - Add `NODE_ENV=production`
7. Click "Deploy"

### 2. Deploy Frontend Service

1. In the same project, click "New Service" again
2. Select "GitHub Repo"
3. Choose the same "Kr8thor/marden-docker-deployment" repository
4. In the "Settings" tab:
   - Set the root directory to `/frontend`
   - Set the main branch to `main`
5. In the "Variables" tab:
   - Add `NODE_ENV=production`
   - Add `VITE_API_URL=https://<YOUR_BACKEND_URL>/api` (Replace with your actual backend URL)
6. Click "Deploy"

### 3. Set Up Custom Domain (Optional)

1. Select your frontend service
2. Go to the "Settings" tab
3. Click on "Custom Domain"
4. Either:
   - Enter your custom domain (e.g., audit.mardenseo.com)
   - Or generate a Railway subdomain

### 4. Testing Your Deployment

1. Once deployed, click on your frontend service domain to open the application
2. Test the application functionality to ensure it's working correctly
3. If you encounter any issues, check the service logs for both backend and frontend

## Troubleshooting

If you encounter issues with the deployment:

1. **Redis Connection Issues**:
   - Check that the Redis URL is correctly linked from the Redis service
   - Verify that the backend service has access to the Redis service

2. **API Connectivity Issues**:
   - Ensure the `VITE_API_URL` in the frontend points to the correct backend URL
   - Check for any CORS issues in the backend logs

3. **Build Failures**:
   - Check the deployment logs for specific error messages
   - Verify that all dependencies are correctly listed in package.json

## Maintenance

To update your deployment:

1. Push changes to your GitHub repository
2. Railway will automatically detect the changes and redeploy the affected services

## Monitoring

Railway provides built-in monitoring for your services:

1. Go to the "Metrics" tab of each service to view:
   - CPU usage
   - Memory usage
   - Network activity
   - Disk usage

2. Check the "Logs" tab to troubleshoot issues
