#!/bin/bash

# KnightHaven Events Tab Startup Script
echo "🎉 Starting KnightHaven Events Tab..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt

# Start the Python API in the background
echo "🐍 Starting Events API on port 5001..."
python3 events_api.py &
API_PID=$!

# Wait a moment for the API to start
sleep 3

# Check if the API is running
if curl -s http://localhost:5001/api/events/health > /dev/null; then
    echo "✅ Events API is running successfully!"
    echo "📡 API: http://localhost:5001"
    echo "🔗 Events: http://localhost:5001/api/events"
else
    echo "⚠️ Events API may not be running properly"
fi

echo ""
echo "🎉 KnightHaven Events Tab is ready!"
echo "📡 Events API: http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000 (click Events button)"
echo ""
echo "Press Ctrl+C to stop the API"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping Events API..."
    kill $API_PID 2>/dev/null
    echo "✅ Events API stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for the API process
wait
