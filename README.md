# MardenSEO Audit Tool Docker Deployment

This repository contains Docker configuration for deploying the MardenSEO Audit Tool, replacing the previous Vercel-based deployment.

## Overview

The MardenSEO Audit Tool Docker deployment includes:

- Frontend (React + Nginx)
- Backend (Node.js API server)
- Redis (replacing Upstash Redis for data storage and job queuing)

## Repository Structure

```
marden-docker-deployment/
├── docker-compose.yml        # Main Docker Compose file combining all services
├── frontend/                 # Frontend Docker configuration
│   ├── Dockerfile            # Frontend build and Nginx configuration
│   ├── docker-compose.yml    # Standalone frontend Docker Compose
│   └── nginx.conf            # Nginx server configuration
├── backend/                  # Backend Docker configuration
│   ├── Dockerfile            # Backend Node.js configuration
│   └── docker-compose.yml    # Standalone backend Docker Compose
├── DOCKER_DEPLOYMENT.md      # Detailed deployment guide
└── README.md                 # This file
```

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/marden-docker-deployment.git
   cd marden-docker-deployment
   ```

2. Create a `.env` file with required environment variables:
   ```bash
   touch .env
   # Add required variables to .env file
   ```

3. Run the Docker Compose setup:
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost or your configured domain

## Documentation

For complete deployment instructions, please see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md).

## Requirements

- Docker
- Docker Compose
- Git

## License

ISC
