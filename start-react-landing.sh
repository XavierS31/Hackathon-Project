#!/bin/bash

# KnightHaven React Landing Page Auto-Start Script
# This script starts the amazing React landing page

echo "🚀 Starting KnightHaven React Landing Page..."

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Start React development server
echo "⚛️ Starting React Development Server (Port 3000)..."
cd /Users/joshuaperez/new_project/Hackathon-Project/react-landing
npm start &
REACT_PID=$!

# Wait for React server to start
sleep 5

echo ""
echo "✅ KnightHaven React Landing Page is now running!"
echo "⚛️ React App: http://localhost:3000"
echo "🎨 Amazing animations and interactions!"
echo "📱 Fully responsive design!"
echo ""
echo "Press Ctrl+C to stop the server"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping React server..."
    kill $REACT_PID 2>/dev/null || true
    echo "✅ Server stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
