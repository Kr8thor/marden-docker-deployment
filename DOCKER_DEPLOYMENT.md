# MardenSEO Audit Tool Docker Deployment Guide

This guide provides comprehensive instructions for deploying the MardenSEO Audit Tool using Docker, replacing the previous Vercel-based deployment.

## Architecture Overview

The MardenSEO Audit Tool consists of three main components:

1. **Frontend**: Nginx serving a static website built with React
2. **Backend**: Node.js API server handling SEO audit requests
3. **Redis**: Data storage and job queuing (replacing Upstash Redis)

## Deployment Options

### Option 1: Automated Deployment Script

The easiest way to deploy is using the provided deployment script:

1. SSH into your server as a user with sudo privileges:
   ```bash
   ssh marddium@209.74.67.40
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/Kr8thor/marden-docker-deployment.git
   cd marden-docker-deployment
   ```

3. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

The script will:
- Install Docker and Docker Compose if needed
- Install Certbot and obtain SSL certificates if they don't exist
- Build and start the Docker containers
- Set up automatic certificate renewal

### Option 2: Manual Deployment

For more control, you can deploy manually:

#### 1. Server Preparation

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Set Up SSL Certificates

```bash
# Install Certbot
sudo apt-get install -y certbot

# Stop any existing web servers
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# Obtain SSL certificate
sudo certbot certonly --standalone --preferred-challenges http -d audit.mardenseo.com
```

#### 3. Clone and Configure the Repository

```bash
# Clone the repository
git clone https://github.com/Kr8thor/marden-docker-deployment.git
cd marden-docker-deployment

# Configure environment variables
cp .env.example .env
nano .env
```

Update the `.env` file with appropriate values, particularly:
- `ALLOWED_ORIGINS=https://audit.mardenseo.com`

#### 4. Build and Start the Containers

```bash
# Build the Docker images
sudo docker-compose build

# Start the containers
sudo docker-compose up -d
```

#### 5. Set Up Certificate Renewal

```bash
# Edit crontab
sudo crontab -e
```

Add this line:
```
0 3 * * * certbot renew --quiet && docker-compose -f /path/to/marden-docker-deployment/docker-compose.yml restart frontend
```

## Domain and DNS Configuration

Ensure that DNS for audit.mardenseo.com points to your server:

1. Log in to your domain registrar (Namecheap)
2. Navigate to the DNS settings for mardenseo.com
3. Create or update an A record for audit.mardenseo.com pointing to your server IP (209.74.67.40)

## Maintenance and Updates

### Updating the Application

To update the application:

```bash
# Navigate to the deployment directory
cd /path/to/marden-docker-deployment

# Pull the latest code
git pull

# Rebuild and restart containers
docker-compose build
docker-compose up -d
```

### Checking Logs

```bash
# View all logs
docker-compose logs

# View logs for a specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f
```

### Backup and Recovery

Set up regular Redis backups:

```bash
# Create a backup script
cat > backup-redis.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/redis"
mkdir -p $BACKUP_DIR
docker exec marden-docker-deployment_redis_1 redis-cli SAVE
docker cp marden-docker-deployment_redis_1:/data/dump.rdb $BACKUP_DIR/redis-backup-$TIMESTAMP.rdb
# Optional: remove backups older than 30 days
find $BACKUP_DIR -name "redis-backup-*.rdb" -type f -mtime +30 -delete
EOF

# Make it executable
chmod +x backup-redis.sh

# Add to crontab
crontab -e
```

Add this line to run daily backups:
```
0 2 * * * /path/to/backup-redis.sh
```

## Troubleshooting

### Container Issues

If containers aren't starting:

```bash
# Check container status
docker-compose ps

# View error logs
docker-compose logs
```

### SSL Issues

If SSL certificates aren't working:

```bash
# Check certificate existence
ls -la /etc/letsencrypt/live/audit.mardenseo.com/

# Check certificate expiration
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect audit.mardenseo.com:443 -servername audit.mardenseo.com
```

### Network Issues

If services can't communicate:

```bash
# Check Docker networks
docker network ls
docker network inspect marden-docker-deployment_default

# Check port usage
sudo netstat -tulpn | grep -E ':(80|443|3000|6379)'
```

## Security Considerations

1. Keep Docker and all images updated
2. Restrict SSH access using key-based authentication
3. Configure a firewall (UFW) to only allow necessary ports
4. Use secure passwords and environment variables
5. Regularly back up your data

## Additional Configuration

### Setting Up a Firewall

```bash
# Install UFW
sudo apt-get install -y ufw

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw enable
```

### Setting Up Monitoring (Optional)

Consider installing tools like:
- Prometheus and Grafana for metrics
- Portainer for container management
- Watchtower for automatic container updates
