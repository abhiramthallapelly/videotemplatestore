@echo off
echo ========================================
echo   ABHIRAM CREATIONS - Complete Startup
echo ========================================
echo.
echo This script will start all services:
echo - Backend Server (Port 5050)
echo - Admin Dashboard (Port 3001) 
echo - Public Website (Port 3000)
echo.

REM Check if dependencies are installed
echo Checking dependencies...
cd admin-dashboard
if not exist node_modules\react-scripts (
    echo.
    echo ERROR: Dependencies not installed!
    echo Please run install-dependencies.bat first
    echo.
    pause
    exit /b 1
)
cd ..\backend
if not exist node_modules (
    echo.
    echo ERROR: Backend dependencies not installed!
    echo Please run install-dependencies.bat first
    echo.
    pause
    exit /b 1
)
cd ..

echo Dependencies check passed!
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
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

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
REM Try to start public website using Java static server or Node http-server
where java >nul 2>nul
if %ERRORLEVEL%==0 (
    if not exist tools\StaticFileServer.class (
        if exist tools\StaticFileServer.java (
            javac tools\StaticFileServer.java || echo Failed to compile Java server.
        )
    )
    if exist tools\StaticFileServer.class (
        start "Public Website" cmd /k "java -cp tools StaticFileServer 3000"
        goto :after_website
    )
)

if exist node_modules\.bin\http-server.cmd (
    start "Public Website" cmd /k "node_modules\.bin\http-server.cmd -p 3000 -o"
    goto :after_website
)

echo.
echo WARNING: Could not start web server automatically.
echo Please start it manually using one of these methods:
echo   1. Ensure Java JDK is installed and on PATH, then run: javac tools\StaticFileServer.java && java -cp tools StaticFileServer 3000
echo   2. Install http-server: npm install http-server
echo      then run: npx http-server -p 3000
echo.

:after_website

echo.
echo ========================================
echo   All services are starting...
echo ========================================
echo.
echo Backend API:        http://localhost:5050
echo Admin Dashboard:    http://localhost:3001
echo Public Website:     http://localhost:3000
echo.
echo Services will open in separate windows.
echo.
echo Press any key to exit this script...
pause >nul
