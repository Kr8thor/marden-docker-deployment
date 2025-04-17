# MardenSEO Audit Tool Deployment Guide

This guide provides instructions for deploying the complete MardenSEO Audit Tool, including both frontend and backend components.

## Overview

The MardenSEO Audit Tool consists of two repositories:
1. Frontend: https://github.com/Kr8thor/marden-audit-reimagined.git
2. Backend: https://github.com/Kr8thor/marden-audit-backend.git

These components are deployed together on Vercel, with Redis Upstash for data storage and job queuing.

## Prerequisites

- GitHub account
- Vercel account
- Upstash account (for Redis)
- Domain name (audit.mardenseo.com)

## Steps for Deployment

### 1. Set Up Upstash Redis

1. Create an account at [Upstash](https://upstash.com/) if you don't have one
2. Create a new Redis database
   - Choose the region closest to your target audience
   - Select a name like `marden-audit-redis`
3. In the database details, note the following:
   - `REDIS_URL` (REST URL)
   - `REDIS_TOKEN` (REST Token)
4. Enable TLS for the database for enhanced security

### 2. Deploy Backend to Vercel

1. Fork or push the backend repository to your GitHub account
2. Log in to Vercel and create a new project
3. Import the backend repository
4. Configure the project:
   - Framework preset: Node.js
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `REDIS_URL`: Your Upstash Redis REST URL
   - `REDIS_TOKEN`: Your Upstash Redis REST Token
   - `PORT`: `3000`
   - `QUEUE_NAME`: `marden_audit_queue`
   - `PROCESSING_QUEUE_NAME`: `marden_audit_processing`
   - `JOB_PREFIX`: `job:`
   - `MAX_PAGES`: `20`
   - `CRAWL_DEPTH`: `2`
   - `TIMEOUT`: `30000`
   - `USER_AGENT`: `MardenSEO Audit Bot v1.0`
   - `ALLOWED_ORIGINS`: `https://audit.mardenseo.com`
   - `LOG_LEVEL`: `info`
6. Deploy the backend

### 3. Deploy Frontend to Vercel

1. Fork or push the frontend repository to your GitHub account
2. Log in to Vercel and create a new project
3. Import the frontend repository
4. Configure the project:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/`
5. Add environment variables:
   - `VITE_API_URL`: `/api`
6. Deploy the frontend

### 4. Configure Domain and Vercel Integration

1. Add your domain (audit.mardenseo.com) to the frontend project in Vercel
2. Set up DNS records as instructed by Vercel
3. Once the domain is verified, go to the frontend project settings
4. Under "Integrations", choose "Add Integration" and select "Rewrites"
5. Configure a rewrite:
   - Source path: `/api/:path*`
   - Destination: `https://<your-backend-vercel-url>/:path*`
   - Status code: 200
6. Save the configuration

### 5. Set Up Worker for Processing Jobs

For production use, it's recommended to set up a separate worker instance to handle job processing:

#### Using Vercel Cron Jobs (Simplest)

1. In the backend project, create a `vercel.json` file:
   ```json
   {
     "functions": {
       "api/*.js": {
         "memory": 1024,
         "maxDuration": 60
       }
     },
     "crons": [
       {
         "path": "/api/worker",
         "schedule": "* * * * *"
       }
     ]
   }
   ```

2. Create an API route for the worker at `api/worker.js`:
   ```javascript
   import AuditWorker from '../src/services/worker';

   export default async function handler(req, res) {
     const worker = new AuditWorker();
     
     try {
       // Process a batch of jobs
       await worker.processNextBatch();
       
       res.status(200).json({
         status: 'ok',
         message: 'Worker processed job batch',
       });
     } catch (error) {
       res.status(500).json({
         status: 'error',
         message: error.message,
       });
     }
   }
   ```

#### Using a Dedicated Server (More Robust)

For higher volume or more reliable processing:

1. Set up a small VPS or container
2. Clone the backend repository
3. Install dependencies with `npm install`
4. Create a `.env` file with the same Redis credentials
5. Run the worker with `node src/services/worker/index.js`
6. Set up a process manager like PM2 to keep it running

### 6. Final Steps and Verification

1. Visit your domain (audit.mardenseo.com) to ensure the frontend is loading
2. Test an audit request to verify the backend is processing correctly
3. Check the Redis dashboard to confirm jobs are being processed
4. Set up monitoring for the application:
   - Vercel Analytics
   - Upstash Redis monitoring
   - (Optional) Set up error tracking with Sentry or similar

## Troubleshooting

### API Connection Issues

If the frontend can't connect to the backend:
1. Verify the rewrite rules in Vercel
2. Check CORS settings in the backend
3. Ensure environment variables are set correctly

### Job Processing Issues

If jobs are not being processed:
1. Check Redis connection in the backend logs
2. Verify worker is running and connected to Redis
3. Look for error messages in Vercel logs

### Resource Limitations

Vercel Serverless Functions have limits:
1. Execution time: 60 seconds
2. Memory: 1024MB
3. Request payload: 4.5MB

For larger sites or more intensive audits, consider using a dedicated server for the backend.

## Maintenance and Updates

1. Monitor Redis usage and upgrade plan if necessary
2. Regularly update dependencies in both repositories
3. Watch for performance issues with large sites
4. Consider implementing rate limiting for public usage

## Security Considerations

1. Implement rate limiting to prevent abuse
2. Add authentication for admin functions
3. Regularly rotate Redis credentials
4. Consider adding CAPTCHA for public usage
5. Monitor for unusual traffic patterns

---

For additional support or custom deployment configurations, contact the MardenSEO team.