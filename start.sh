#!/bin/sh

# Start nginx for frontend
nginx -g "daemon off;" &
echo "Nginx started."

# Start backend
echo "Starting backend..."
npm start
