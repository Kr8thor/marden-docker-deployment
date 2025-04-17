#!/bin/bash

# Script to deploy MardenSEO Audit Tool on a server
# This script should be run on the server

# Stop execution if any command fails
set -e

echo "Starting MardenSEO Audit Tool deployment..."

# Check if running as root or with sudo
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root or with sudo"
    exit 1
fi

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found, installing..."
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found, installing..."
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Check for existing SSL certificates
SSL_CERT_PATH="/etc/letsencrypt/live/audit.mardenseo.com"
if [ ! -d "$SSL_CERT_PATH" ]; then
    echo "SSL certificates not found at $SSL_CERT_PATH"
    echo "Installing Certbot and obtaining SSL certificates..."
    
    # Install Certbot
    apt-get update
    apt-get install -y certbot
    
    # Stop any existing web servers
    systemctl stop nginx 2>/dev/null || true
    systemctl stop apache2 2>/dev/null || true
    
    # Obtain SSL certificate
    certbot certonly --standalone --preferred-challenges http -d audit.mardenseo.com
    
    if [ ! -d "$SSL_CERT_PATH" ]; then
        echo "Failed to obtain SSL certificates. Please check your domain DNS settings."
        exit 1
    fi
fi

# Build and start Docker containers
echo "Building and starting Docker containers..."
cd "$(dirname "$0")"
docker-compose build
docker-compose up -d

# Set up SSL certificate renewal
echo "Setting up automatic SSL certificate renewal..."
CRON_JOB="0 3 * * * certbot renew --quiet && docker-compose -f $(pwd)/docker-compose.yml restart frontend"
(crontab -l 2>/dev/null || echo "") | grep -v "certbot renew" | { cat; echo "$CRON_JOB"; } | crontab -

echo "Deployment complete! MardenSEO Audit Tool should now be accessible at https://audit.mardenseo.com"
echo "Check the logs with: docker-compose logs"
