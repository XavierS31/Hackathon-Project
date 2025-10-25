@echo off
REM KnightHaven Complete Startup Script for Windows
REM This script starts all components of the KnightHaven system

echo Starting KnightHaven Complete System
echo =====================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the Hackathon-Project directory
    exit /b 1
)

if not exist "events_tab" (
    echo [ERROR] Please run this script from the Hackathon-Project directory
    exit /b 1
)

REM Start Backend (Events Scraper API)
echo [INFO] Setting up Backend (Events Scraper API)...
cd events_tab\backend

REM Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt

REM Start the backend API
echo [INFO] Starting Events Scraper API on port 5001...
start "Backend API" python events_api.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go back to project root
cd ..\..

REM Start Frontend (React App)
echo [INFO] Setting up Frontend (React App)...
cd frontend

REM Install Node.js dependencies
echo [INFO] Installing Node.js dependencies...
npm install

REM Start the React frontend
echo [INFO] Starting React frontend...
start "Frontend" npm run dev

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

REM Go back to project root
cd ..

echo [SUCCESS] KnightHaven is now running!
echo =====================================
echo [INFO] Backend API: http://localhost:5001
echo [INFO] Frontend: http://localhost:3000 (or 3001/3002 if 3000 is busy)
echo [INFO] Events API: http://localhost:5001/api/events
echo [INFO] Health Check: http://localhost:5001/api/events/health
echo.
echo [INFO] Tips:
echo [INFO] • The scraper runs once per day and caches results
echo [INFO] • Events are scraped from https://events.ucf.edu/
echo [INFO] • Click 'Events' in the frontend to see scraped events
echo [INFO] • Each event card is clickable and links to the UCF event page
echo.
echo [WARNING] To stop the system:
echo [WARNING] • Close the command windows that opened
echo [WARNING] • Or press Ctrl+C in each window
echo.
echo [INFO] System is running... Press any key to stop

pause >nul
