#!/bin/bash

# Trap exit and cleanup
cleanup() {
  echo "Cleaning up child processes..."
  pkill -TERM -P $$     # Graceful shutdown
  sleep 2
  pkill -KILL -P $$     # Force kill if still alive
}
trap cleanup SIGINT SIGTERM EXIT

# Run concurrently
npx concurrently \
  "npm run dashboard:dev" \
  "nodemon --ignore ./public/ ./bin/www"