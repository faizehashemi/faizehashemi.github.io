@echo off
rem RECORDING MODE: opens the UMS in Chrome; you log in and use the screens normally, everything is written to .ums-bridgeecordings\ for Claude.
cd /d "%~dp0"
set UMS_BROWSER_CHANNEL=chrome
npm run record -- --name %1
pause
