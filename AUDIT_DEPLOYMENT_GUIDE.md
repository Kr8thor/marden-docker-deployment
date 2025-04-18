# Marden SEO Audit Deployment Guide

This guide outlines how to deploy the Marden SEO Audit application to Railway with the custom domain audit.mardenseo.com.

## Deployment Process

### 1. Prerequisites

- Railway account and CLI installed
- Railway token set in your environment
- Access to your domain's DNS settings
- Redis URL from Upstash

### 2. Manual Deployment Steps

#### Backend Deployment

1. Set your Railway token:
   ```bash
   # PowerShell
   $env:RAILWAY_TOKEN = "your-railway-token"
   
   # Bash
   export RAILWAY_TOKEN="your-railway-token"
   ```

2. Deploy the backend:
   ```bash
   cd backend
   railway up
   ```

3. Set backend environment variables:
   ```bash
   railway variables --set "NODE_ENV=production" --set "REDIS_URL=redis://default:AVOLAAIjcDFmNzVjNDVjZGM3MGY0NDczODEyMTA0NTAyOGNkMTc5OXAxMA@smiling-shrimp-21387.upstash.io:6379"
   ```

#### Frontend Deployment

1. Deploy the frontend:
   ```bash
   cd frontend
   railway up
   ```

2. Set frontend environment variables:
   ```bash
   railway variables --set "NODE_ENV=production" --set "VITE_API_URL=https://audit.mardenseo.com/api"
   ```

3. Add custom domain:
   ```bash
   railway domain add audit.mardenseo.com
   ```

### 3. Automated Deployment

You can use the provided deployment scripts instead of manual steps:

```bash
# PowerShell
./deploy-to-railway.ps1

# Bash
./deploy-to-railway.sh
```

### 4. DNS Configuration

After adding the custom domain in Railway, you'll receive DNS configuration instructions:

1. Add a CNAME record for audit.mardenseo.com pointing to the Railway domain
2. If using Cloudflare, ensure SSL/TLS is set to "Full" or "Full (Strict)"
3. Wait for DNS propagation (may take up to 48 hours, but usually faster)

### 5. SSL Certificate

Railway will automatically provision an SSL certificate for your custom domain once the DNS configuration is validated.

### 6. Verification

Once deployed and DNS is configured:

1. Visit https://audit.mardenseo.com to verify your frontend is working
2. Test the API by visiting https://audit.mardenseo.com/api/health

### 7. Troubleshooting

If deployment fails:

1. Check the Railway logs for error messages:
   ```bash
   railway logs
   ```

2. Verify environment variables are set correctly:
   ```bash
   railway variables
   ```

3. Ensure Redis connection is working:
   ```bash
   railway service Redis
   railway connect
   ```

4. Check DNS configuration using a tool like [DNSChecker](https://dnschecker.org)

### 8. Maintenance

To update your deployment after code changes:

1. Commit and push changes to your GitHub repository
2. Run the deployment script or `railway up` command again
