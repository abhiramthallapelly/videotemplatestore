@echo off
echo Starting Public Website on port 3000...
echo.

REM Try Java first, then Node, then Python fallback message
where java >nul 2>nul
if %ERRORLEVEL%==0 (
    echo Java found. Compiling Java static server if needed...
    if not exist tools\StaticFileServer.class (
        if exist tools\StaticFileServer.java (
            javac tools\StaticFileServer.java || (
                echo Failed to compile Java server.
            )
        )
    )
    if exist tools\StaticFileServer.class (
        echo Starting Java static server on port 3000...
        java -cp tools StaticFileServer 3000
        goto :eof
    )
)

if exist node_modules\.bin\http-server.cmd (
    echo Using http-server (Node.js)...
    node_modules\.bin\http-server.cmd -p 3000 -o
    goto :eof
)

if exist node_modules\http-server\bin\http-server (
    echo Using http-server (Node.js)...
    node node_modules\http-server\bin\http-server -p 3000 -o
    goto :eof
)

echo.
echo ERROR: Could not find Java or Node http-server to start the web server.
echo Install one of the following and re-run this script:
echo   - Java JDK (javac/java on PATH) to use the bundled Java static server
echo   - Node.js and run: npm install http-server
echo.
pause

