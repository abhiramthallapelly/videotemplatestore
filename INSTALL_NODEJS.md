# Node.js Installation Required

## Problem
Your project requires Node.js to run the backend server and admin dashboard, but Node.js is not currently installed or not in your system PATH.

## Solution

### Step 1: Install Node.js
1. Download Node.js from: **https://nodejs.org/**
2. Choose the **LTS (Long Term Support)** version
3. Run the installer and follow the installation wizard
4. **Important**: Make sure to check the box that says "Add to PATH" during installation

### Step 2: Verify Installation
After installation, **restart your terminal/PowerShell** and run:
```powershell
node --version
npm --version
```

Both commands should show version numbers.

### Step 3: Restart Services
Once Node.js is installed, you can run your project using:

**Option A: Use the batch file**
```powershell
.\start-all-services.bat
```

**Option B: Start services manually**
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Admin Dashboard  
cd admin-dashboard
$env:PORT=3001
$env:REACT_APP_API_URL="http://localhost:5050"
npm start

# Terminal 3 - Public Website
cd ..
javac tools\StaticFileServer.java
java -cp tools StaticFileServer 3000
```

- ## Current Status
- ✅ **Public Website**: Can run with Java static server or Node http-server
- ❌ **Backend Server**: Requires Node.js (Port 5050)
- ❌ **Admin Dashboard**: Requires Node.js (Port 3001)

## Access URLs (once all services are running)
- Public Website: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- Backend API: http://localhost:5050

