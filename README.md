# MardenSEO Audit Tool Docker Deployment

This repository contains Docker configuration for deploying the MardenSEO Audit Tool, replacing the previous Vercel-based deployment.

## Overview

The MardenSEO Audit Tool Docker deployment includes:

- Frontend (React + Nginx)
- Backend (Node.js API server)
- Redis (replacing Upstash Redis for data storage and job queuing)

## Local Testing

To test the application locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/Kr8thor/marden-docker-deployment.git
   cd marden-docker-deployment
   ```

2. Run the local testing script:
   ```bash
   chmod +x run-local.sh
   ./run-local.sh
   ```

3. Access the application at http://localhost

4. To view logs:
   ```bash
   docker-compose -f docker-compose.local.yml logs -f
   ```

5. To stop the local setup:
   ```bash
   docker-compose -f docker-compose.local.yml down
   ```

## Server Deployment

To deploy on a production server:

1. SSH into your server:
   ```bash
   ssh username@server-ip-address
   ```

2. Clone this repository:
   ```bash
   git clone https://github.com/Kr8thor/marden-docker-deployment.git
   cd marden-docker-deployment
   ```

3. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

   This script will:
   - Install Docker and Docker Compose if needed
   - Check for SSL certificates and obtain them if not present
   - Build and start the Docker containers
   - Set up automatic certificate renewal

4. The application will be accessible at https://audit.mardenseo.com

## Manual Deployment

If you prefer to deploy manually:

1. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

2. Check for SSL certificates:
   ```bash
   ls -la /etc/letsencrypt/live/audit.mardenseo.com/
   ```

3. If certificates don't exist, install Certbot and obtain them:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d audit.mardenseo.com
   ```

4. Build and start the Docker containers:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

5. Set up automatic certificate renewal:
   ```bash
   sudo crontab -e
   # Add this line:
   0 3 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.yml restart frontend
   ```

## Troubleshooting

- **SSL Issues**: If you're having SSL certificate problems, check the paths in docker-compose.yml and ensure they match your actual certificate paths.
- **Connection Issues**: Check if the ports 80 and 443 are open in your firewall.
- **API Errors**: Verify the .env configuration, especially the ALLOWED_ORIGINS value.

## License

ISC
