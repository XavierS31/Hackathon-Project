#!/bin/bash

# KnightHaven Events Scraper Startup Script
echo "🚀 Starting KnightHaven Events System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Start the Python scraper API in the background
echo "🐍 Starting Python Events Scraper API on port 5000..."
python3 events_scraper.py &
SCRAPER_PID=$!

# Wait a moment for the API to start
sleep 3

# Check if the API is running
if curl -s http://localhost:5000/api/events/health > /dev/null; then
    echo "✅ Events Scraper API is running successfully!"
else
    echo "⚠️ Events Scraper API may not be running properly"
fi

# Start the frontend
echo "⚛️ Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 KnightHaven Events System is starting up!"
echo "📡 Events API: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Events Page: http://localhost:3000 (click Events button)"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $SCRAPER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait
