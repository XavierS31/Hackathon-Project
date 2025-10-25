@echo off
setlocal enabledelayedexpansion

REM KnightHaven Startup Script for Windows
REM This script starts both the backend API server and frontend development server

echo 🚀 Starting KnightHaven Application...
echo ======================================

REM Kill existing Node.js processes
echo 🛑 Stopping existing servers...
taskkill /f /im node.exe >nul 2>&1
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

REM Kill processes on ports 3000 and 3001
echo 🔪 Ensuring ports 3000 and 3001 are available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

REM Set environment variables
set FRONTEND_PORT=3000
set BACKEND_PORT=3001
set DATABASE_URL=file:./dev.db
set PORT=%BACKEND_PORT%

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
echo 📊 API Health: http://localhost:3001/api/health
echo 📈 API Stats: http://localhost:3001/api/stats
echo.
echo 💡 Features:
echo • Auth0 authentication with Login/Signup button
echo • SQLite database with Prisma ORM
echo • Express.js API server
echo • React frontend with Vite
echo.
echo Both servers are running in separate console windows.
echo Close those windows to stop the servers.
echo.
pause
