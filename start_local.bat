@echo off
title ARGOS AI Local Launcher
echo ========================================================
echo   ARGOS AI - Local Development Launcher
echo   Protect. Detect. Verify. Respond.
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Launching FastAPI Backend Core (Port 8000)...
start "ARGOS AI - Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Waiting for Backend initialization...
timeout /t 3 /nobreak >nul

echo [3/3] Launching Next.js Frontend (Port 3000)...
start "ARGOS AI - Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   ARGOS AI is booting up!
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://127.0.0.1:8000
echo   - API Docs:  http://127.0.0.1:8000/docs
echo ========================================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:3000

echo Done! Press any key to exit this launcher window (services will stay running).
pause >nul
