@echo off
echo ===================================================================
echo   TOYOTA INDUSTRIES ENGINE INDIA (TIEI) - GD DIVISION
echo   TPS Competency Development & Learning Management System
echo   Backend Server: Python / Flask REST API
echo ===================================================================
echo.
echo Starting backend server on http://127.0.0.1:5000 ...
cd /d "%~dp0"
python app.py
pause
