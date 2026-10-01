@echo off
echo ========================================================
echo   Starting TIEI - TPS Competency & LMS Prototype Server
echo ========================================================
echo Verifying SQLite Database...
python init_db.py
echo Starting Web Server on http://127.0.0.1:5000 ...
start http://127.0.0.1:5000
python app.py
pause
