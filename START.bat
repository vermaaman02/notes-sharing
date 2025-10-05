@echo off
echo Starting Notes Sharing Platform...
echo.
echo Starting Backend Server...
start cmd /k "cd /d backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start cmd /k "cd /d frontend && npm start"
echo.
echo ========================================
echo   NOTES SHARING PLATFORM STARTED!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Admin Login:
echo ID: 11663645
echo Password: amanverma
echo.
echo Press any key to exit...
pause >nul