#!/bin/bash
# Kill any process using port 8081 (the Wunder Mobility dev server port)
PID=$(lsof -ti tcp:8081)
if [ -n "$PID" ]; then
  echo "Stopping dev server (PID $PID) on port 8081..."
  kill -SIGTERM $PID
  sleep 1
  if kill -0 $PID 2>/dev/null; then
    kill -9 $PID
  fi
  echo "Server stopped."
else
  echo "No server running on port 8081."
fi
