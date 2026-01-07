# How to Start the Backend Server

## Quick Start

### Option 1: Using Batch File (Windows)
Double-click `start-backend-server.bat` or run:
```bash
start-backend-server.bat
```

### Option 2: Using Command Line
```bash
cd backend
npm start
```

### Option 3: Using PowerShell
```powershell
cd backend
node server.js
```

## Verify Server is Running

Once started, you should see:
```
Server running on port 5050 in development mode
Health check available at: http://localhost:5050/api/health
Connected to SQLite database at: ./database.sqlite
```

## Test the Server

Open your browser and visit:
- Health Check: http://localhost:5050/api/health
- Store Items: http://localhost:5050/api/store/items

## Troubleshooting

### Port 5050 Already in Use
If port 5050 is already in use:
1. Find the process: `netstat -ano | findstr :5050`
2. Kill the process or change PORT in `backend/env.development`

### Database Errors
If you see database errors:
1. Delete `backend/database.sqlite` (⚠️ This deletes all data)
2. Restart the server (it will recreate the database)

### Module Not Found Errors
If you see "Cannot find module" errors:
```bash
cd backend
npm install
```

## Keep Server Running

To keep the server running in the background:
- Use `start-backend-server.bat` which opens a new window
- Or use a process manager like PM2:
  ```bash
  npm install -g pm2
  pm2 start backend/server.js --name video-store-backend
  ```

