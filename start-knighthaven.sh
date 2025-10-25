#!/bin/bash

# KnightHaven Complete Startup Script
# This script starts all components of the KnightHaven system

set -e  # Exit on any error

echo "Starting KnightHaven Complete System"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "events_tab" ]; then
    print_error "Please run this script from the Hackathon-Project directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    print_warning "Port $port is in use. Attempting to free it..."
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Check and free required ports
print_status "Checking required ports..."
REQUIRED_PORTS=(3000 5001 5173)
for port in "${REQUIRED_PORTS[@]}"; do
    if check_port $port; then
        print_warning "Port $port is already in use"
        kill_port $port
    fi
done

# Start Backend (Events Scraper API)
print_status "Setting up Backend (Events Scraper API)..."
cd events_tab/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Start the backend API
print_status "Starting Events Scraper API on port 5001..."
python events_api.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! check_port 5001; then
    print_error "Backend failed to start on port 5001"
    exit 1
fi

print_success "Backend API started successfully (PID: $BACKEND_PID)"

# Go back to project root
cd ../..

# Start Frontend (React App)
print_status "Setting up Frontend (React App)..."
cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Start the React frontend
print_status "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! check_port 3000 && ! check_port 3001 && ! check_port 3002; then
    print_error "Frontend failed to start"
    exit 1
fi

print_success "Frontend started successfully (PID: $FRONTEND_PID)"

# Go back to project root
cd ..

print_success "KnightHaven is now running!"
echo "====================================="
print_status "Backend API: http://localhost:5001"
print_status "Frontend: http://localhost:3000 (or 3001/3002 if 3000 is busy)"
print_status "Events API: http://localhost:5001/api/events"
print_status "Health Check: http://localhost:5001/api/events/health"
echo ""
print_status "Tips:"
print_status "• The scraper runs once per day and caches results"
print_status "• Events are scraped from https://events.ucf.edu/"
print_status "• Click 'Events' in the frontend to see scraped events"
print_status "• Each event card is clickable and links to the UCF event page"
echo ""
print_warning "To stop the system:"
print_warning "• Press Ctrl+C to stop this script"
print_warning "• Or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
print_status "System is running... Press Ctrl+C to stop"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down KnightHaven..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    print_success "KnightHaven stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
