@echo off
setlocal enabledelayedexpansion

REM KnightHaven Windows Setup Test Script
REM This script tests if all components are properly configured

echo 🧪 Testing KnightHaven Windows Setup
echo =====================================

set ALL_TESTS_PASSED=1

REM Test 1: Check if we're in the right directory
echo 🔍 Test 1: Project structure...
if not exist "package.json" (
    echo ❌ package.json not found
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ package.json found
)

if not exist "frontend\package.json" (
    echo ❌ frontend/package.json not found
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ frontend/package.json found
)

if not exist "events_tab\backend\events_api.py" (
    echo ❌ events_tab/backend/events_api.py not found
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ events_tab/backend/events_api.py found
)

REM Test 2: Check Node.js
echo.
echo 🔍 Test 2: Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found
    set ALL_TESTS_PASSED=0
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    set ALL_TESTS_PASSED=0
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
)

REM Test 3: Check Python
echo.
echo 🔍 Test 3: Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found
    set ALL_TESTS_PASSED=0
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ Python: %%i
)

pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip not found
    set ALL_TESTS_PASSED=0
) else (
    for /f "tokens=*" %%i in ('pip --version') do echo ✅ pip: %%i
)

REM Test 4: Check dependencies
echo.
echo 🔍 Test 4: Dependencies...
if not exist "node_modules" (
    echo ❌ Root node_modules not found - run: npm install
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ Root node_modules found
)

if not exist "frontend\node_modules" (
    echo ❌ Frontend node_modules not found - run: cd frontend && npm install
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ Frontend node_modules found
)

REM Test 5: Check Python dependencies
echo.
echo 🔍 Test 5: Python dependencies...
cd events_tab\backend
python -c "import flask, flask_cors, requests, bs4" >nul 2>&1
if errorlevel 1 (
    echo ❌ Python dependencies missing - run: pip install -r requirements.txt
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ Python dependencies found
)
cd ..\..

REM Test 6: Check database
echo.
echo 🔍 Test 6: Database...
if not exist "prisma\dev.db" (
    echo ❌ Database not found - run: npx prisma db push
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ Database found
)

REM Test 7: Check ports
echo.
echo 🔍 Test 7: Port availability...
netstat -ano | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 3000 is in use
) else (
    echo ✅ Port 3000 available
)

netstat -ano | findstr ":3001" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 3001 is in use
) else (
    echo ✅ Port 3001 available
)

netstat -ano | findstr ":5001" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 5001 is in use
) else (
    echo ✅ Port 5001 available
)

REM Test 8: Check Prisma
echo.
echo 🔍 Test 8: Prisma setup...
npx prisma --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Prisma not found - run: npm install
    set ALL_TESTS_PASSED=0
) else (
    echo ✅ Prisma found
)

REM Summary
echo.
echo =====================================
if %ALL_TESTS_PASSED%==1 (
    echo 🎉 All tests passed! Your setup is ready.
    echo.
    echo 🚀 You can now run: start-knighthaven-simple.bat
    echo.
    echo 📋 Next steps:
    echo 1. Run: start-knighthaven-simple.bat
    echo 2. Open: http://localhost:3000
    echo 3. Check console windows for any errors
) else (
    echo ❌ Some tests failed. Please fix the issues above.
    echo.
    echo 🔧 Common fixes:
    echo • Run: setup-windows.bat
    echo • Install missing dependencies
    echo • Check that Python and Node.js are in PATH
    echo • Free up ports 3000, 3001, 5001
)

echo.
pause

