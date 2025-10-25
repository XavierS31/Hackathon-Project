#!/bin/bash

# KnightHaven User Functionality Auto-Start Script
# This script starts the user authentication system

echo "🚀 Starting KnightHaven User Functionality..."

# Kill any existing processes on these ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start User API server in background
echo "🔧 Starting User API Server (Port 3001)..."
npm run start:clean &
API_PID=$!

# Wait for API server to start
sleep 3

# Start Frontend server in background
echo "🌐 Starting Frontend Server (Port 8080)..."
cd ../frontend
python3 -m http.server 8080 &
FRONTEND_PID=$!

# Wait for frontend server to start
sleep 2

echo ""
echo "✅ KnightHaven User Functionality is now running!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 User API: http://localhost:3001"
echo "🔐 Auth Page: http://localhost:8080/user_functionality/frontend/auth.html"
echo "🛍️ Marketplace: http://localhost:8080/marketplace.html"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping KnightHaven User servers..."
    kill $API_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
