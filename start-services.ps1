# Start all services for ABHIRAM CREATIONS project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ABHIRAM CREATIONS - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Start Backend Server
Write-Host "Starting Backend Server on port 5050..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot\backend
    node server.js
}

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Admin Dashboard
Write-Host "Starting Admin Dashboard on port 3001..." -ForegroundColor Yellow
$adminJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot\admin-dashboard
    $env:PORT = "3001"
    $env:REACT_APP_API_URL = "http://localhost:5050"
    npm start
}

# Wait a bit for admin to start
Start-Sleep -Seconds 3

# Start Public Website
Write-Host "Starting Public Website on port 3000..." -ForegroundColor Yellow
$websiteJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot
    # Try Java static server if available, else fall back to npx http-server
    $java = Get-Command java -ErrorAction SilentlyContinue
    if ($java) {
        if (-not (Test-Path -Path tools\StaticFileServer.class)) {
            if (Test-Path -Path tools\StaticFileServer.java) {
                javac tools\StaticFileServer.java
            }
        }
        if (Test-Path -Path tools\StaticFileServer.class) {
            java -cp tools StaticFileServer 3000
            return
        }
    }

    # Fallback to Node http-server if installed
    if (Test-Path -Path node_modules\.bin\http-server) {
        & node_modules\.bin\http-server -p 3000 -o
    } else {
        Write-Host "No Java JDK or http-server found. Please install Java JDK or run: npm install http-server" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services are starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:        http://localhost:5050" -ForegroundColor Cyan
Write-Host "Admin Dashboard:    http://localhost:3001" -ForegroundColor Cyan
Write-Host "Public Website:     http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are running in the background." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow
Write-Host ""

# Keep script running and monitor jobs
try {
    while ($true) {
        Start-Sleep -Seconds 5
        $backendStatus = Get-Job -Id $backendJob.Id | Select-Object -ExpandProperty State
        $adminStatus = Get-Job -Id $adminJob.Id | Select-Object -ExpandProperty State
        $websiteStatus = Get-Job -Id $websiteJob.Id | Select-Object -ExpandProperty State
        
        if ($backendStatus -eq "Failed" -or $adminStatus -eq "Failed" -or $websiteStatus -eq "Failed") {
            Write-Host "One or more services failed. Check job output:" -ForegroundColor Red
            Get-Job | Receive-Job
            break
        }
    }
} catch {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    Stop-Job $backendJob, $adminJob, $websiteJob
    Remove-Job $backendJob, $adminJob, $websiteJob
}

