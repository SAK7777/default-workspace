@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

node server.js
pause
exit /b 0

:nonode
echo.
echo  Node.js not found on this machine.
echo  Falling back to opening index.html directly...
echo.
start "" "index.html"
pause
exit /b 0
