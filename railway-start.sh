#!/bin/bash

# Display the current directory contents for debugging
echo "Current directory structure:"
ls -la

echo "Frontend directory structure:"
ls -la frontend || echo "Frontend directory not found"

echo "Backend directory structure:"
ls -la backend || echo "Backend directory not found"

# Build the frontend
echo "Installing frontend dependencies..."
cd frontend && npm install

echo "Building frontend..."
npm run build

# Serve the frontend with a simple server
echo "Installing serve..."
npm install -g serve

# Start the server in the background
echo "Starting frontend server..."
serve -s dist -l 80 &

# Install and run backend
echo "Installing backend dependencies..."
cd ../backend && npm install

echo "Starting backend server..."
npm start
