# Railway Deployment Instructions

Since the Railway CLI doesn't support non-interactive login, follow these steps to deploy your application using the Railway web interface:

## 1. Backend Service Deployment

1. Go to your [Railway dashboard](https://railway.app/dashboard)
2. Click "New Service" → "GitHub Repo"
3. Select the "Kr8thor/marden-docker-deployment" repository
4. Configure the service:
   - Set the root directory to: `/backend`
   - Environment: Production
   - Set environment variables:
     - `NODE_ENV=production`
     - `REDIS_URL=${{REDIS_URL}}` (Reference to your Redis service)
   - Click "Deploy"

## 2. Frontend Service Deployment

1. In your project, click "New Service" → "GitHub Repo" again
2. Select the same "Kr8thor/marden-docker-deployment" repository
3. Configure the service:
   - Set the root directory to: `/frontend`
   - Environment: Production
   - Set environment variables:
     - `NODE_ENV=production`
     - `VITE_API_URL=https://<YOUR_BACKEND_DOMAIN>/api` (Replace with your actual backend domain)
   - Click "Deploy"

## 3. Add Domain to Frontend

1. Go to your frontend service
2. Click on "Settings" → "Domains"
3. Add a custom domain or generate a Railway domain

## 4. Connect Services

1. Go to your project settings
2. Make sure all services (Redis, Backend, Frontend) are connected with proper references

Your application will be available at the domain assigned to your frontend service.
