# MardenSEO Audit Tool Docker Deployment Guide

This guide provides instructions for deploying the complete MardenSEO Audit Tool using Docker, replacing the previous Vercel deployment.

## Overview

The MardenSEO Audit Tool now consists of three Docker services:
1. Frontend: Nginx serving the React application
2. Backend: Node.js API server
3. Redis: For data storage and job queuing (replacing Upstash Redis)

## Prerequisites

- Docker and Docker Compose installed on your server
- Domain name configured (audit.mardenseo.com)
- Basic knowledge of Docker and Linux server administration

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/marden-docker-deployment.git
cd marden-docker-deployment
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file with required variables
touch .env

# Add the following variables to your .env file:
# REDIS_URL=redis://redis:6379
# REDIS_TOKEN=your_token_if_needed
```

### 3. Update the nginx.conf (if needed)

The `frontend/nginx.conf` file is already configured to serve the frontend and proxy API requests to the backend. However, you may need to update the server_name if you're using a different domain:

```nginx
server {
    listen       80;
    server_name  your-domain.com;  # Update this if needed
    # ... rest of the config
}
```

### 4. Run the Docker Compose Setup

```bash
docker-compose up -d
```

This will:
- Build and start the frontend container (exposed on port 80)
- Build and start the backend container (exposed on port 3000, but only accessible from Docker network)
- Start a Redis container for data storage

### 5. Verify the Deployment

Once the containers are running, you should be able to access the application at your domain or server IP address.

Check the container logs if you encounter any issues:

```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs redis
```

### 6. Set up SSL/TLS (HTTPS)

For production use, you should set up HTTPS. You have several options:

#### Option 1: Using a reverse proxy like Nginx or Traefik on the host

This is recommended for production environments.

#### Option 2: Update the docker-compose.yml to include a Certbot container

Add a Certbot service to automatically obtain and renew SSL certificates.

### 7. Ongoing Maintenance

#### Updating the application

To update the application:

```bash
# Pull the latest code
git pull

# Rebuild and restart the containers
docker-compose up -d --build
```

#### Backup

It's important to regularly backup the Redis data:

```bash
# Create a backup directory
mkdir -p backups

# Backup Redis data
docker exec marden-docker-deployment_redis_1 redis-cli SAVE
docker cp marden-docker-deployment_redis_1:/data/dump.rdb backups/redis-backup-$(date +%Y%m%d).rdb
```

## Troubleshooting

### Frontend Issues

If the frontend isn't loading:
- Check that the Nginx configuration is correct
- Verify that the frontend container is running: `docker-compose ps`
- Check the logs: `docker-compose logs frontend`

### Backend Issues

If the backend API isn't working:
- Verify that the backend container is running: `docker-compose ps`
- Check the logs: `docker-compose logs backend`
- Ensure environment variables are set correctly in .env

### Redis Issues

If there are issues with Redis:
- Check that the Redis container is running: `docker-compose ps`
- Verify the logs: `docker-compose logs redis`
- Ensure the backend can connect to Redis

## Worker Deployment

For higher volume sites, you may want to separate the worker from the API:

1. Create a separate Dockerfile for the worker in `backend/Dockerfile.worker`
2. Add a worker service to docker-compose.yml
3. Configure the worker to use the same Redis instance

## Security Considerations

1. Use a firewall to restrict access to your server
2. Set up proper user management and avoid running containers as root
3. Regularly update Docker and all images
4. Use Docker secrets for sensitive environment variables
5. Implement rate limiting for the API
