@echo off
setlocal enabledelayedexpansion

:: Get the directory of the script
set "SCRIPT_DIR=%~dp0"
cd /d "!SCRIPT_DIR!"

echo Current directory: !SCRIPT_DIR!

:: Check for node_modules
if not exist "node_modules\" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

echo Starting Architecture Web App...
echo Opening browser...
start http://localhost:5173

echo Starting server...
call npm run dev

pause

