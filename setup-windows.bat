@echo off
setlocal enabledelayedexpansion

REM KnightHaven Windows Setup Script
REM This script helps set up the development environment on Windows

echo 🚀 KnightHaven Windows Setup
echo =============================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the Hackathon-Project directory
    echo Usage: setup-windows.bat
    pause
    exit /b 1
)

echo 📋 Checking system requirements...

REM Check Node.js
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org
    echo Make sure to download the LTS version
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: %NODE_VERSION%
)

REM Check npm
echo 🔍 Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    echo Please reinstall Node.js with npm included
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm found: %NPM_VERSION%
)

REM Check Python
echo 🔍 Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    echo After installing Python, restart this script
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ Python found: %PYTHON_VERSION%
)

REM Check pip
echo 🔍 Checking pip...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not available
    echo Please reinstall Python with pip included
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('pip --version') do set PIP_VERSION=%%i
    echo ✅ pip found: %PIP_VERSION%
)

echo.
echo 📦 Installing Node.js dependencies...

REM Install root dependencies
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install root dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Root dependencies already installed
)

REM Install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ✅ Frontend dependencies already installed
)

echo.
echo 🐍 Installing Python dependencies...

REM Check if events_tab/backend exists
if not exist "events_tab\backend" (
    echo ❌ Events API backend directory not found
    echo Please ensure the project structure is correct
    pause
    exit /b 1
)

REM Install Python dependencies
cd events_tab\backend
if not exist "requirements.txt" (
    echo ❌ Python requirements.txt not found
    cd ..\..
    pause
    exit /b 1
)

echo Installing Python packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    echo Try running manually: pip install flask flask-cors requests beautifulsoup4 html5lib
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo.
echo 🗄️ Setting up database...

REM Check if database exists
if not exist "prisma\dev.db" (
    echo Creating database...
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
    echo ✅ Database created successfully
) else (
    echo ✅ Database already exists
)

echo.
echo 🎉 Setup complete!
echo ==================
echo.
echo ✅ All dependencies installed
echo ✅ Database ready
echo ✅ Environment configured
echo.
echo 🚀 You can now run: start-knighthaven-simple.bat
echo.
echo 📋 System Summary:
echo • Node.js: %NODE_VERSION%
echo • npm: %NPM_VERSION%
echo • Python: %PYTHON_VERSION%
echo • pip: %PIP_VERSION%
echo.
echo 🔧 If you encounter issues:
echo • Make sure all ports (3000, 3001, 5001) are available
echo • Check that Python and Node.js are in your PATH
echo • Run this setup script again if needed
echo.
pause
