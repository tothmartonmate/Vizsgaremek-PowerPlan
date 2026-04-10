@echo off
setlocal

cd /d "%~dp0"

echo.
echo [PowerPlan] Inditas folyamatban...

where docker >nul 2>nul
if errorlevel 1 (
  echo [HIBA] A Docker CLI nem erheto el. Telepitsd a Docker Desktopot, majd probald ujra.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [HIBA] A Docker Desktop nem fut vagy nem erheto el.
  echo Inditsd el a Docker Desktopot, varj amig teljesen betolt, aztan futtasd ujra ezt a fajlt.
  pause
  exit /b 1
)

echo [PowerPlan] Containerek inditasa...
docker compose up --build -d
if errorlevel 1 (
  echo [HIBA] A docker compose inditas sikertelen.
  pause
  exit /b 1
)

echo [PowerPlan] Backend varakozas...
set ATTEMPTS=0

:wait_backend
set /a ATTEMPTS+=1
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -UseBasicParsing http://localhost:5001/api/health -TimeoutSec 3; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 goto backend_ready

if %ATTEMPTS% GEQ 30 (
  echo [HIBA] A backend nem allt fel idoben.
  echo Ellenorizd a containereket: docker compose ps
  pause
  exit /b 1
)

timeout /t 2 /nobreak >nul
goto wait_backend

:backend_ready
echo [PowerPlan] Minden szolgaltatas elindult.
echo.
echo Frontend:    http://localhost:5173
echo Backend:     http://localhost:5001
echo Health:      http://localhost:5001/api/health
echo phpMyAdmin:  http://localhost:8081
echo.

start "" "http://localhost:5173"
start "" "http://localhost:5001/api/health"
start "" "http://localhost:8081"

echo A PowerPlan elindult. Ez az ablak bezarhato.
pause
exit /b 0