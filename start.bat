@echo off
chcp 65001 > nul
title Chic Shop Galena's Store Server

echo =========================================================
echo    ✨ Chic Shop Galena's - Women's Accessories Store ✨
echo =========================================================
echo.
echo [1/3] Checking dependencies...
python -c "import flask" 2>nul
if %errorlevel% neq 0 (
    echo Flask is not installed. Installing Flask...
    pip install -r backend\requirements.txt
)

echo [2/3] Opening browser at http://127.0.0.1:5000 ...
start http://127.0.0.1:5000

echo [3/3] Starting store server...
echo.
python server.py
pause
