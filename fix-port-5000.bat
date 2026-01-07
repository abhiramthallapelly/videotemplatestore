@echo off
echo ========================================
echo   Fix Port 5000 Already in Use
echo ========================================
echo.
echo Finding process using port 5000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    set PID=%%a
    echo Found process with PID: %%a
    echo.
    echo Killing process...
    taskkill /PID %%a /F
    echo.
    echo Process killed. Waiting 2 seconds...
    timeout /t 2 /nobreak >nul
)

echo.
echo Port 5000 should now be free.
echo You can now start the backend server.
echo.
pause

