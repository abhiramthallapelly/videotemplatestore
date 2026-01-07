@echo off
echo ========================================
echo   Video Editing Store - Clean Startup
echo ========================================
echo.
echo This script will start both services:
echo - Backend Server (Port 5050)
echo - Admin Dashboard (Port 3001)
echo.
echo Press any key to start the backend server...
pause >nul

echo.
echo Starting Backend Server on port 5050...
echo.
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo Backend server started! 
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting Admin Dashboard on port 3001...
echo.
cd ..\admin-dashboard
start "Admin Dashboard" cmd /k "npm start"

echo.
echo ========================================
echo   Both services are starting...
echo ========================================
echo.
echo Backend API:    http://localhost:5050
echo Admin Dashboard: http://localhost:3001
echo.
echo Press any key to exit this script...
pause >nul
