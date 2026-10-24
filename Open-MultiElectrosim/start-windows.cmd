@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 20 or newer, then open this file again.
 pause
 exit /b 1
)
echo Open http://localhost:3000 in your browser once the server starts.
node server.js
pause
