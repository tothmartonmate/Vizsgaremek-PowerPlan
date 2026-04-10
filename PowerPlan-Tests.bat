@echo off
setlocal

cd /d "%~dp0"

echo.
echo [PowerPlan] Ellenorzes es teszteles inditasa...

where npm >nul 2>nul
if errorlevel 1 (
  echo [HIBA] Az npm nem erheto el. Telepitsd a Node.js-t, majd probald ujra.
  pause
  exit /b 1
)

where npx >nul 2>nul
if errorlevel 1 (
  echo [HIBA] Az npx nem erheto el. Telepitsd a Node.js-t, majd probald ujra.
  pause
  exit /b 1
)

echo.
echo [1/3] Frontend build futtatasa...
pushd Frontend
call npm run build
if errorlevel 1 (
  popd
  echo [HIBA] A frontend build sikertelen.
  pause
  exit /b 1
)
popd

echo.
echo [2/3] Backend Jest tesztek futtatasa...
pushd Backend
call npx jest test/services/nutritionHelpers.test.js test/services/workoutHelpers.test.js --runInBand
if errorlevel 1 (
  popd
  echo [HIBA] A backend tesztek megbuktak.
  pause
  exit /b 1
)
popd

echo.
echo [3/3] Frontend Selenium tesztek futtatasa lathato Google Chrome ablakban...
where docker >nul 2>nul
if errorlevel 1 (
  echo [HIBA] A Docker CLI nem erheto el. A Selenium tesztek Dockerrel inditjak a szukseges szolgaltatasokat.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [HIBA] A Docker Desktop nem fut vagy nem erheto el.
  echo Inditsd el a Docker Desktopot, aztan futtasd ujra ezt a fajlt.
  pause
  exit /b 1
)

pushd Frontend
call npm run test:all
if errorlevel 1 (
  popd
  echo [HIBA] A frontend Selenium tesztek megbuktak.
  pause
  exit /b 1
)
popd

echo.
echo [PowerPlan] Minden build es teszt sikeresen lefutott.
pause
exit /b 0