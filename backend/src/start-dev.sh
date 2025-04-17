#!/bin/bash
# Start both API and worker services in development mode

# Start API server
npm run dev &
API_PID=$!

# Start worker
npm run dev:worker &
WORKER_PID=$!

# Handle shutdown
function cleanup {
  echo "Shutting down services..."
  kill $API_PID
  kill $WORKER_PID
  exit
}

# Register cleanup function
trap cleanup SIGINT SIGTERM

echo "Services started. Press Ctrl+C to stop."
wait
