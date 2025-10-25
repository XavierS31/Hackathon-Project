# KnightHaven Windows Setup Guide

This guide will help you set up and run KnightHaven on Windows.

## Prerequisites

### Required Software

1. **Node.js 18+ (LTS recommended)**
   - Download from: https://nodejs.org
   - Make sure to check "Add to PATH" during installation
   - Verify installation: `node --version` and `npm --version`

2. **Python 3.8+**
   - Download from: https://python.org
   - **IMPORTANT**: Check "Add Python to PATH" during installation
   - Verify installation: `python --version` and `pip --version`

3. **Git (optional but recommended)**
   - Download from: https://git-scm.com

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```cmd
   setup-windows.bat
   ```
   This will check all requirements and install dependencies.

2. **Start the application:**
   ```cmd
   start-knighthaven-simple.bat
   ```

### Option 2: Manual Setup

1. **Install Node.js dependencies:**
   ```cmd
   npm install
   cd frontend
   npm install
   cd ..
   ```

2. **Install Python dependencies:**
   ```cmd
   cd events_tab\backend
   pip install -r requirements.txt
   cd ..\..
   ```

3. **Set up database:**
   ```cmd
   npx prisma generate
   npx prisma db push
   ```

4. **Start all servers:**
   ```cmd
   start-knighthaven-simple.bat
   ```

## Application Structure

```
KnightHaven/
├── start-knighthaven-simple.bat    # Windows startup script
├── setup-windows.bat              # Windows setup script
├── package.json                   # Node.js dependencies
├── server.js                      # Backend API server
├── frontend/                      # React frontend
│   ├── package.json
│   └── src/
├── events_tab/backend/            # Python Events API
│   ├── events_api.py
│   └── requirements.txt
└── prisma/                        # Database
    ├── schema.prisma
    └── dev.db
```

## Services and Ports

The application runs three services:

- **Frontend (React)**: http://localhost:3000
- **Backend API (Node.js)**: http://localhost:3001
- **Events API (Python)**: http://localhost:5001

## Troubleshooting

### Common Issues

#### 1. Python Not Found
**Error**: `❌ Python is not installed or not in PATH`

**Solution**:
- Install Python from https://python.org
- During installation, check "Add Python to PATH"
- Restart your command prompt/terminal
- Verify with: `python --version`

#### 2. Node.js Not Found
**Error**: `❌ Node.js is not installed`

**Solution**:
- Install Node.js from https://nodejs.org
- Choose the LTS version
- Restart your command prompt/terminal
- Verify with: `node --version`

#### 3. Port Already in Use
**Error**: Ports 3000, 3001, or 5001 are busy

**Solutions**:
- Close other applications using these ports
- Run the startup script again (it will kill existing processes)
- Check what's using the port: `netstat -ano | findstr :3000`

#### 4. Python Dependencies Failed
**Error**: `❌ Failed to install Python dependencies`

**Solutions**:
- Try: `pip install --upgrade pip`
- Try: `pip install flask flask-cors requests beautifulsoup4 html5lib`
- Check Python version: `python --version` (should be 3.8+)

#### 5. Database Issues
**Error**: `❌ Failed to push database schema`

**Solutions**:
- Delete `prisma/dev.db` and try again
- Check Prisma installation: `npx prisma --version`
- Try: `npx prisma generate` then `npx prisma db push`

#### 6. Frontend Build Issues
**Error**: Frontend fails to start

**Solutions**:
- Delete `frontend/node_modules` and run `npm install` again
- Check Node.js version: `node --version` (should be 18+)
- Try: `cd frontend && npm install --force`

### Manual Server Startup

If the batch script doesn't work, you can start servers manually:

#### Terminal 1 - Backend API:
```cmd
set DATABASE_URL=file:./dev.db
set PORT=3001
node server.js
```

#### Terminal 2 - Frontend:
```cmd
cd frontend
npm run dev -- --port 3000
```

#### Terminal 3 - Events API:
```cmd
cd events_tab\backend
python events_api.py
```

### Verification

After starting all services, verify they're working:

1. **Frontend**: http://localhost:3000
2. **Backend Health**: http://localhost:3001/api/health
3. **Events API**: http://localhost:5001/api/events/health

### Logs and Debugging

Each service runs in its own console window. Check these windows for error messages:

- **Backend Server**: Shows API requests and database operations
- **Frontend Server**: Shows Vite build process and React errors
- **Events API Server**: Shows Python scraping and API responses

### Performance Tips

1. **Close unnecessary applications** to free up ports and memory
2. **Use SSD storage** for better database performance
3. **Keep Python and Node.js updated** to latest stable versions
4. **Restart your computer** if you encounter persistent issues

### Getting Help

If you're still having issues:

1. **Check the console windows** for specific error messages
2. **Verify all prerequisites** are installed correctly
3. **Try running the setup script again**: `setup-windows.bat`
4. **Check Windows Defender** isn't blocking the applications
5. **Run as Administrator** if permission issues occur

## Features

KnightHaven includes:

- ✅ **Auth0 Authentication** - Secure login/signup
- ✅ **SQLite Database** - Local data storage with Prisma ORM
- ✅ **Express.js API** - RESTful backend services
- ✅ **React Frontend** - Modern web interface with Vite
- ✅ **Python Events API** - UCF events scraping and caching
- ✅ **Real-time Updates** - Live data synchronization

## Development

For development:

- **Backend API**: Edit `server.js` and related files
- **Frontend**: Edit files in `frontend/src/`
- **Events API**: Edit `events_tab/backend/events_api.py`
- **Database**: Edit `prisma/schema.prisma` and run `npx prisma db push`

## Support

This Windows setup has been tested on:
- Windows 10/11
- Node.js 18+
- Python 3.8+
- Modern browsers (Chrome, Firefox, Edge)

For issues specific to your environment, check the console output for detailed error messages.
