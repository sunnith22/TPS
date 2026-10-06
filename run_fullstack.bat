@echo off
echo ===================================================================
echo   TOYOTA INDUSTRIES ENGINE INDIA (TIEI) - GD DIVISION
echo   TPS Competency Development & Learning Management System
echo   Backend: Node.js (Express + TypeScript) & PostgreSQL
echo   Frontend: React (Vite + TypeScript + Tailwind CSS)
echo ===================================================================
echo.
echo 1. Starting Node.js Backend Server on http://127.0.0.1:8000...
start "TIEI TPS LMS Backend (Node.js + PostgreSQL)" cmd /k "cd /d "%~dp0server" && npm run dev"

echo.
echo 2. Starting React Frontend Client on http://localhost:3000...
start "TIEI TPS LMS Frontend (React + Vite)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ===================================================================
echo   Both services are launching in separate windows.
echo   Open your browser to: http://localhost:3000
echo ===================================================================
pause
