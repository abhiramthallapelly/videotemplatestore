@echo off
echo ========================================
echo   ABHIRAM CREATIONS - Complete System
echo ========================================
echo.
echo This script will start the complete system:
echo - Backend Server (Port 5050) - API + Auth + Store
echo - Admin Dashboard (Port 3001) - Manage content
echo - Public Website (Port 3000) - Landing page
echo - Store Page (Port 3000/store.html) - User store
echo.
echo Press any key to start all services...
pause >nul

echo.
echo Starting Backend Server on port 5050...
echo.
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo Backend server started! 
echo Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo Starting Admin Dashboard on port 3001...
echo.
cd ..\admin-dashboard
start "Admin Dashboard" cmd /k "npm start"

echo.
echo Admin Dashboard started!
echo Waiting 5 seconds for dashboard to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting Public Website on port 3000...
echo.
cd ..
start "Public Website" cmd /k "npx http-server -p 3000 -o"

echo.
echo ========================================
echo   All services are starting...
echo ========================================
echo.
echo Backend API:        http://localhost:5050
echo Admin Dashboard:    http://localhost:3001
echo Public Website:     http://localhost:3000
echo Store Page:         http://localhost:3000/store.html
echo.
echo ========================================
echo   NEW FEATURES AVAILABLE:
echo ========================================
echo.
echo 🔐 User Authentication:
echo    - User registration and login
echo    - JWT token-based sessions
echo    - Secure password hashing
echo.
echo 🛍️ Digital Store:
echo    - Browse templates and files
echo    - Free and paid downloads
echo    - Category filtering and search
echo    - Purchase tracking
echo.
echo 📊 Admin Features:
echo    - Upload templates and files
echo    - Set pricing and categories
echo    - Track downloads and purchases
echo    - Manage user accounts
echo.
echo Services will open in separate windows.
echo.
echo Press any key to exit this script...
pause >nul
