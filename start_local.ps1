# ========================================================
# ARGOS AI - PowerShell Local Launcher
# Protect. Detect. Verify. Respond.
# ========================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ARGOS AI - Local Development Launcher" -ForegroundColor Cyan
Write-Host "  Protect. Detect. Verify. Respond." -ForegroundColor DarkCyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend in new process
Write-Host "[1/3] Launching FastAPI Backend Core (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

# 2. Start Frontend in new process
Write-Host "[2/3] Launching Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Start-Sleep -Seconds 2

# 3. Open Browser
Write-Host "[3/3] Opening Browser at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ARGOS AI is online!" -ForegroundColor Green
Write-Host "  - Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend:   http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  - API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
