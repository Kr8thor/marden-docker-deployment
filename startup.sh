#!/bin/bash

# Build and serve frontend
echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build

# Install and run backend
echo "Installing backend dependencies..."
cd ../backend
npm install

echo "Starting backend server..."
npm start
