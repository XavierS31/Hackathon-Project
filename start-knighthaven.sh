#!/bin/bash

# KnightHaven Startup Script
# This script starts both the backend API server and frontend development server

echo "🚀 Starting KnightHaven Application..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill existing processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping KnightHaven servers...${NC}"
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "python.*events_api.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    sleep 2
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Function to force kill processes on specific ports
force_kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔪 Killing processes on port $port: $pids${NC}"
        kill -9 $pids 2>/dev/null
        sleep 2
    fi
}

# Function to wait for server to be ready
wait_for_server() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}⏳ Waiting for $name to start...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $name is ready!${NC}"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $name failed to start after $max_attempts seconds${NC}"
    return 1
}

# Trap to cleanup on exit
trap cleanup EXIT

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the Hackathon-Project directory${NC}"
    echo "Usage: ./start-knighthaven.sh"
    exit 1
fi

# Check if node_modules exist
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    cd frontend && npm install && cd ..
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}🗄️ Setting up database...${NC}"
    DATABASE_URL="file:./dev.db" npx prisma generate
    DATABASE_URL="file:./dev.db" npx prisma db push
fi

# Force kill any processes on required ports
echo -e "${YELLOW}🔪 Ensuring ports 3000, 3001, and 5001 are available...${NC}"
force_kill_port 3000
force_kill_port 3001
force_kill_port 5001

# Set fixed ports
FRONTEND_PORT=3000
BACKEND_PORT=3001

# Start Python Events API server
echo -e "${BLUE}🐍 Starting Python Events API server on port 5001...${NC}"
cd events_tab/backend
python3 events_api.py &
EVENTS_PID=$!
cd ../..

# Wait for events API to be ready
if ! wait_for_server "http://localhost:5001/api/events/health" "Events API"; then
    echo -e "${RED}❌ Failed to start events API server${NC}"
    exit 1
fi

# Start backend server
echo -e "${BLUE}🔧 Starting backend API server on port $BACKEND_PORT...${NC}"
DATABASE_URL="file:./dev.db" PORT=$BACKEND_PORT node server.js &
BACKEND_PID=$!

# Wait for backend to be ready
if ! wait_for_server "http://localhost:$BACKEND_PORT/api/health" "Backend API"; then
    echo -e "${RED}❌ Failed to start backend server${NC}"
    exit 1
fi

# Start frontend server
echo -e "${BLUE}🎨 Starting frontend development server on port $FRONTEND_PORT...${NC}"
cd frontend
npm run dev -- --port $FRONTEND_PORT --host 0.0.0.0 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
if ! wait_for_server "http://localhost:$FRONTEND_PORT" "Frontend"; then
    echo -e "${RED}❌ Failed to start frontend server${NC}"
    exit 1
fi

# Success message
echo ""
echo -e "${GREEN}🎉 KnightHaven is now running!${NC}"
echo "======================================"
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 Backend:${NC}  http://localhost:3001"
echo -e "${GREEN}🐍 Events API:${NC} http://localhost:5001"
echo -e "${GREEN}📊 API Health:${NC} http://localhost:3001/api/health"
echo -e "${GREEN}📈 API Stats:${NC} http://localhost:3001/api/stats"
echo -e "${GREEN}🎉 Events:${NC} http://localhost:5001/api/events"
echo ""
echo -e "${YELLOW}💡 Features:${NC}"
echo "• Auth0 authentication with Login/Signup button"
echo "• SQLite database with Prisma ORM"
echo "• Express.js API server"
echo "• React frontend with Vite"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all servers${NC}"

# Wait for user interrupt
trap 'echo -e "\n${YELLOW}🛑 Shutting down...${NC}"; cleanup; exit 0' INT

# Keep script running and monitor processes
echo -e "${BLUE}🔄 Monitoring servers... Press Ctrl+C to stop${NC}"
while true; do
    sleep 5
    # Check if processes are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend server stopped unexpectedly${NC}"
        break
    fi
    if ! kill -0 $EVENTS_PID 2>/dev/null; then
        echo -e "${RED}❌ Events API server stopped unexpectedly${NC}"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend server stopped unexpectedly${NC}"
        break
    fi
done
