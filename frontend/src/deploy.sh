#!/bin/bash

# Create .npmrc file to use legacy-peer-deps
echo "legacy-peer-deps=true" > .npmrc
echo "Created .npmrc with legacy-peer-deps=true"

# Deploy to Vercel
vercel deploy --prod

echo "Deployment complete!"
