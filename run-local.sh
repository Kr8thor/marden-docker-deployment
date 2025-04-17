#!/bin/bash

# Script to run MardenSEO Audit Tool locally for testing

echo "Starting MardenSEO Audit Tool locally..."

# Copy the local nginx conf
cp frontend/nginx.local.conf frontend/nginx.conf

# Build and start Docker containers using the local compose file
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d

echo "MardenSEO Audit Tool should now be accessible at http://localhost"
echo "Check the logs with: docker-compose -f docker-compose.local.yml logs -f"
