@echo off
rem Starts the UMS bridge for the PMS website on this computer. UMS opens in a Chrome window where YOU log in (credentials, CAPTCHA, Login).
cd /d "%~dp0"
set UMS_MANUAL_LOGIN=1
set UMS_HEADLESS=0
set UMS_BROWSER_CHANNEL=chrome
npm run serve
pause
