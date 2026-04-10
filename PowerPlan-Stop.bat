@echo off
setlocal

cd /d "%~dp0"

echo.
echo [PowerPlan] Leallitas folyamatban...

where docker >nul 2>nul
if errorlevel 1 (
  echo [HIBA] A Docker CLI nem erheto el.
  pause
  exit /b 1
)

docker compose down
if errorlevel 1 (
  echo [HIBA] A leallitas sikertelen.
  pause
  exit /b 1
)

echo [PowerPlan] A stack leallt.
pause
exit /b 0