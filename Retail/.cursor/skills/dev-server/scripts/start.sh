#!/bin/bash
PROJECT_DIR="/Users/jette.dieckmann/Documents/Cursor Projects/Template/RFA (Katie)/RFA"

# Extend PATH to cover common Node install locations
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | sort -V | tail -1)/bin:$PATH"

# Load nvm if present and npm still not found
if ! command -v npm &>/dev/null; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

if ! command -v npm &>/dev/null; then
  echo "Error: npm not found. Make sure Node.js is installed."
  exit 1
fi

# Check if already running
PID=$(lsof -ti tcp:8081)
if [ -n "$PID" ]; then
  echo "Dev server is already running on port 8081 (PID $PID)."
  echo "Open: http://localhost:8081"
  exit 0
fi

echo "Starting Wunder Mobility dev server..."
cd "$PROJECT_DIR"
npm start
