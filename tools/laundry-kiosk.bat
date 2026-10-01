@echo off
rem Laundry touch screen: opens the Laundry page full screen in its own Chrome profile with --kiosk-printing,
rem so 🖨 Print goes straight to the Windows DEFAULT printer (set the Canon LBP as default, paper A5) — no dialog.
rem Its own profile (--user-data-dir) means it works even while other Chrome windows are open.
rem Put a shortcut to this file in shell:startup to open it when the PC starts. Exit kiosk with Alt+F4.
rem Change makkah to the laundry's site if needed.

set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe

start "" "%CHROME%" --user-data-dir="%LocalAppData%\PMS-Laundry-Kiosk" --kiosk --kiosk-printing --no-first-run --disable-pinch --overscroll-history-navigation=0 "https://pms.raajsoftware.com/#/makkah/laundry"
