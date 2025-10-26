@echo off
setlocal enabledelayedexpansion

REM KnightHaven Startup Script for Windows
REM This script starts the backend API server, frontend development server, and Python Events API

echo 🚀 Starting KnightHaven Application...
echo ======================================

REM Kill existing processes
echo 🛑 Stopping existing servers...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im python3.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Cleanup complete

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the Hackathon-Project directory
    echo Usage: start-knighthaven-simple.bat
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: Please run this script from the Hackathon-Project directory
    echo Usage: start-knighthaven-simple.bat
    pause
    exit /b 1
)

if not exist "events_tab\backend" (
    echo ❌ Error: Events API backend directory not found
    echo Please ensure events_tab\backend directory exists
    pause
    exit /b 1
)

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Check Python and install Python dependencies
echo 🐍 Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python found
cd events_tab\backend
if not exist "requirements.txt" (
    echo ❌ Python requirements.txt not found in events_tab\backend
    cd ..\..
    pause
    exit /b 1
)

echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    echo Try running: pip install flask flask-cors requests beautifulsoup4 html5lib
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

REM Check if database exists
if not exist "prisma\dev.db" (
    echo 🗄️ Setting up database...
    set DATABASE_URL=file:./dev.db
    call npx prisma generate
    if errorlevel 1 (
        echo ❌ Failed to generate Prisma client
        pause
        exit /b 1
    )
    call npx prisma db push
    if errorlevel 1 (
        echo ❌ Failed to push database schema
        pause
        exit /b 1
    )
)

REM Kill processes on ports 3000, 3001, and 5001
echo 🔪 Ensuring ports 3000, 3001, and 5001 are available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5001"') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

REM Set environment variables
set FRONTEND_PORT=3000
set BACKEND_PORT=3001
set EVENTS_PORT=5001
set DATABASE_URL=file:./dev.db
set PORT=%BACKEND_PORT%

REM Start Python Events API server
echo 🐍 Starting Python Events API server on port %EVENTS_PORT%...
cd events_tab\backend
start "Events API Server" cmd /k "python events_api.py"
cd ..\..

REM Wait a moment for events API to start
timeout /t 3 /nobreak >nul

REM Start backend server
echo 🔧 Starting backend API server on port %BACKEND_PORT%...
start "Backend Server" cmd /k "set DATABASE_URL=file:./dev.db && set PORT=%BACKEND_PORT% && node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🎨 Starting frontend development server on port %FRONTEND_PORT%...
cd frontend
start "Frontend Server" cmd /k "npm run dev -- --port %FRONTEND_PORT%"
cd ..

REM Wait a moment for frontend to start
timeout /t 3 /nobreak >nul

REM Success message
echo.
echo 🎉 KnightHaven is now running!
echo ======================================
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 🐍 Events API: http://localhost:5001
echo 📊 API Health: http://localhost:3001/api/health
echo 📈 API Stats: http://localhost:3001/api/stats
echo 🎉 Events: http://localhost:5001/api/events
echo.
echo 💡 Features:
echo • Auth0 authentication with Login/Signup button
echo • SQLite database with Prisma ORM
echo • Express.js API server
echo • React frontend with Vite
echo • Python Events API with UCF events scraping
echo.
echo All servers are running in separate console windows.
echo Close those windows to stop the servers.
echo.
echo 🔧 Troubleshooting:
echo • If Python fails, ensure Python 3.8+ is installed and in PATH
echo • If ports are busy, close other applications using ports 3000, 3001, 5001
echo • Check the console windows for detailed error messages
echo.
pause
