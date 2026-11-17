@echo off
echo ========================================================
echo   Starting VoxAlign Speech Intelligence Platform...
echo ========================================================
echo.
echo [1/2] Launching Backend API Server (Port 5000)...
start "VoxAlign Server (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

echo [2/2] Launching Frontend Client (Port 5173)...
start "VoxAlign Client (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo   VoxAlign is launching!
echo   Frontend URL: http://localhost:5173
echo   Backend API:  http://localhost:5000
echo ========================================================
echo.
pause
