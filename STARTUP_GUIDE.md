# 🚀 KnightHaven Startup Guide

This guide will help you start both the backend scraper API and frontend React app for KnightHaven.

## 📋 Prerequisites

Before starting, make sure you have:

- **Python 3.8+** installed
- **Node.js 16+** installed  
- **npm** (comes with Node.js)

### Check if you have them:
```bash
python3 --version
node --version
npm --version
```

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)

#### For macOS/Linux:
```bash
chmod +x start-knighthaven-complete.sh
./start-knighthaven-complete.sh
```

#### For Windows:
```cmd
start-knighthaven-complete.bat
```

### Option 2: Manual Startup

#### 1. Start Backend (Events Scraper API)

```bash
# Navigate to backend directory
cd events_tab/backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API
python events_api.py
```

The backend will start on **http://localhost:5001**

#### 2. Start Frontend (React App)

Open a new terminal and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the React app
npm run dev
```

The frontend will start on **http://localhost:5173**

## 🌐 Access Points

Once both are running, you can access:

- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Events API**: http://localhost:5001/api/events
- **Health Check**: http://localhost:5001/api/events/health

## 🎯 How It Works

1. **Backend Scraper**: 
   - Scrapes UCF events from https://events.ucf.edu/ once per day
   - Caches results to avoid repeated scraping
   - Provides API endpoints for the frontend

2. **Frontend App**:
   - React app with Auth0 authentication
   - Events page shows scraped UCF events
   - Each event card is clickable and links to the UCF event page

## 🔧 Features

- **Daily Scraping**: Events are scraped once per day and cached
- **High-Quality Filtering**: Only captures legitimate UCF events
- **Clickable Events**: Each event links to the original UCF event page
- **UCF Branding**: Events display with UCF symbols and theming
- **Responsive Design**: Works on desktop and mobile

## 🛑 Stopping the System

### If using automated startup:
- Press `Ctrl+C` in the terminal

### If running manually:
- Press `Ctrl+C` in each terminal running the services

## 🐛 Troubleshooting

### Backend Issues:
- Make sure port 5001 is not in use
- Check that Python dependencies are installed
- Verify virtual environment is activated

### Frontend Issues:
- Make sure port 5173 is not in use
- Check that Node.js dependencies are installed
- Try clearing npm cache: `npm cache clean --force`

### Scraping Issues:
- Check internet connection
- Verify https://events.ucf.edu/ is accessible
- Check backend logs for scraping errors

## 📊 Monitoring

- **Backend Logs**: Check the terminal running `python events_api.py`
- **Frontend Logs**: Check the terminal running `npm run dev`
- **API Health**: Visit http://localhost:5001/api/events/health

## 🔄 Development

To make changes:

1. **Backend**: Edit files in `events_tab/backend/`
2. **Frontend**: Edit files in `frontend/src/`
3. **Restart**: Stop and restart the affected service

The scraper will automatically pick up changes to the backend code.
