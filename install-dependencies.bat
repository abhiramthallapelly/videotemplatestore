@echo off
echo ========================================
echo   Installing Project Dependencies
echo ========================================
echo.
echo This will install all required dependencies.
echo This may take several minutes...
echo.
pause

echo.
echo ========================================
echo   Step 1: Installing Backend Dependencies
echo ========================================
cd backend
if exist node_modules\dotenv (
    echo Backend dependencies already installed.
) else (
    echo Installing backend dependencies (dotenv, express, etc.)...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install backend dependencies
        echo Make sure Node.js and npm are installed and in your PATH
        echo.
        pause
        exit /b 1
    )
    echo Backend dependencies installed successfully!
)
cd ..

echo.
echo ========================================
echo   Step 2: Installing Admin Dashboard Dependencies
echo ========================================
cd admin-dashboard
if exist node_modules\react-scripts (
    echo Admin Dashboard dependencies already installed.
) else (
    echo Installing admin dashboard dependencies (React, react-scripts, etc.)...
    echo This may take 3-5 minutes, please wait...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install admin dashboard dependencies
        echo Make sure Node.js and npm are installed and in your PATH
        echo.
        pause
        exit /b 1
    )
    echo Admin Dashboard dependencies installed successfully!
)
cd ..

echo.
echo ========================================
echo   Dependencies Installation Complete!
echo ========================================
echo.
echo All dependencies have been installed successfully.
echo.
echo You can now run: start-all-services.bat
echo.
echo Or start services manually:
echo   1. Backend: cd backend ^&^& npm start
echo   2. Admin: cd admin-dashboard ^&^& npm start
echo   3. Website: java -cp tools StaticFileServer 3000  (requires JDK)  OR: npx http-server -p 3000
echo.
pause

