#!/bin/bash

# KnightHaven Auto-Start Script
# This script starts both the API server and frontend server

echo "🚀 Starting KnightHaven Development Environment..."

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Start API server in background
echo "🔧 Starting API Server (Port 3001)..."
cd /Users/joshuaperez/new_project/Hackathon-Project
npm run api &
API_PID=$!

# Wait for API server to start
sleep 3

# Start Frontend server in background
echo "🌐 Starting Frontend Server (Port 8080)..."
cd /Users/joshuaperez/new_project/Hackathon-Project/frontend
python3 -m http.server 8080 &
FRONTEND_PID=$!

# Wait for frontend server to start
sleep 2

echo ""
echo "✅ KnightHaven is now running!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 API: http://localhost:3001"
echo "🛍️ Marketplace: http://localhost:8080/marketplace.html"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping KnightHaven servers..."
    kill $API_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
