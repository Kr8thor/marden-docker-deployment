# MardenSEO Audit Backend

This is the backend API for the MardenSEO Audit tool, providing SEO analysis capabilities for websites and pages.

## Features

- Comprehensive SEO auditing for websites and individual pages
- Asynchronous job processing with Redis queue
- Detailed meta tag analysis
- Content quality assessment
- Technical SEO evaluation
- Performance metrics analysis
- Robust report generation

## Tech Stack

- Node.js
- Express.js
- Redis (Upstash) for queue and caching
- Puppeteer for web crawling and analysis

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Upstash Redis account (for production)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Kr8thor/marden-audit-backend.git
   cd marden-audit-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set Redis configuration
   - Adjust other settings as needed

4. Start the development server:
   ```
   npm run dev
   ```

5. Build for production:
   ```
   npm run build
   ```

## API Endpoints

- `POST /api/audit/site` - Submit a site for audit
- `POST /api/audit/page` - Submit a single page for audit
- `GET /api/job/:id` - Get job status
- `GET /api/job/:id/results` - Get job results
- `GET /api/status` - Get queue status
- `GET /api/health` - Health check

## Deployment to Vercel

### Setup

1. Push your code to GitHub

2. Create a new project in Vercel
   - Connect your GitHub repository
   - Set the framework preset to Node.js
   - Configure the following settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. Environment Variables
   - Add all variables from your `.env` file to Vercel
   - Ensure `REDIS_URL` and `REDIS_TOKEN` are set to your Upstash credentials
   - Set `NODE_ENV=production`

4. Deploy

### Upstash Redis Configuration

1. Create an Upstash Redis database
2. Set the `REDIS_URL` and `REDIS_TOKEN` environment variables in Vercel
3. Configure Redis to allow access from Vercel's IP ranges

### Vercel Serverless Functions Optimization

Since this application uses Puppeteer, which can be resource-intensive:

1. Add the following to your `vercel.json`:
   ```json
   {
     "functions": {
       "api/*.js": {
         "memory": 1024,
         "maxDuration": 60
       }
     }
   }
   ```

2. Consider using Vercel's Edge functions for health checks and status endpoints

## Worker Configuration

For production, it's recommended to set up a separate worker process to handle audit jobs:

1. Deploy the main API to Vercel
2. Set up a separate worker on a VPS or containerized environment
3. Configure both to use the same Redis instance
4. Use environment variables to control worker behavior

## Development Notes

- The crawler has a configurable depth and page limit to prevent excessive resource usage
- For development, the system uses a mock Redis store if Redis is not available
- All analyzers are modular and can be adjusted independently"# Update timestamp: $(date)"  
