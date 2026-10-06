@echo off
echo ========================================================
echo   Starting TIEI TPS LMS Backend (Node.js + PostgreSQL)
echo   Listening on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0"
npm run dev
