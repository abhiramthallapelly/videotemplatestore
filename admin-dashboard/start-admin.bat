@echo off
echo Starting Admin Dashboard...
echo.
echo Make sure the backend server is running on port 5050 first!
echo.
echo Backend should be started from the main project directory with:
echo   cd .. && npm start
echo.
echo Press any key to start the admin dashboard...
pause >nul

echo.
echo Starting Admin Dashboard on port 3001...
echo Admin Dashboard will be available at: http://localhost:3001
echo.
npm start
