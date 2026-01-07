@echo off
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.
echo Starting backend server on port 5050...
echo.
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting server...
node server.js
pause

