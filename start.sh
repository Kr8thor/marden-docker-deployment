#!/bin/sh

# Start nginx for frontend
nginx -g "daemon on;"

# Start backend
cd /app/backend
npm start
