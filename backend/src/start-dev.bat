@echo off
echo Starting Marden SEO Audit Backend services...

:: Start API server in one window
start "Marden API Server" cmd /c "npm run dev"

:: Start worker in another window
start "Marden Worker" cmd /c "npm run dev:worker"

echo Services started in separate windows.
echo Close windows to stop services.
