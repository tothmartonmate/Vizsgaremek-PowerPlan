# PowerPlan

PowerPlan egy edzőtermi webalkalmazás React frontenddel, Express backenddel és MySQL adatbázissal.

Ez az útmutató a teljes alkalmazás elindításához, ellenőrzéséhez és teszteléséhez készült.

## Gyors használat Windows alatt

A Windowsos indítófájlokat a projekt gyökérmappájából kell futtatni.

Ennek helye a Windows Fájlkezelőben:

`C:\Users\pc\Documents\GitHub\powerplanprobalegujabb`

Javasolt lépések:

1. Indítsa el a Docker Desktop alkalmazást.
2. Nyissa meg a Windows Fájlkezelőt.
3. Keresse meg a projekt mappáját ezen az útvonalon: `C:\Users\pc\Documents\GitHub\powerplanprobalegujabb`.
4. A megnyitott projektmappában futtassa a szükséges `.bat` fájlt dupla kattintással.

Használható fájlok:

- `PowerPlan-Start.bat`: a teljes alkalmazás indítása
- `PowerPlan-Tests.bat`: build és tesztek futtatása, a Selenium tesztek látható Google Chrome ablakban
- `PowerPlan-Stop.bat`: a futó szolgáltatások leállítása

Terminálból ugyanez a következő módon futtatható:

```powershell
cd "C:\Users\pc\Documents\GitHub\powerplanprobalegujabb"
.\PowerPlan-Start.bat
.\PowerPlan-Tests.bat
.\PowerPlan-Stop.bat
```

## Gyorsindítás

Ha csak gyorsan el akarod indítani vagy ellenőrizni a projektet Windows alatt, a projekt gyökerében ezeket a fájlokat használd:

- `PowerPlan-Start.bat`: teljes Docker stack indítása és a fontos oldalak megnyitása
- `PowerPlan-Stop.bat`: teljes Docker stack leállítása
- `PowerPlan-Tests.bat`: frontend build, backend Jest tesztek és frontend Selenium tesztek futtatása

Megjegyzés: a `PowerPlan-Tests.bat` Selenium része Dockerrel indítja el a szükséges backend szolgáltatásokat, ezért a Docker Desktopnak futnia kell.
Megjegyzés: a Windowsos gyors futtatás során a Selenium tesztek nem headless módban, hanem látható Google Chrome ablakban futnak végig.

Ajánlott sorrend:

1. Indítsd el a Docker Desktopot.
2. Kattints duplán a `PowerPlan-Start.bat` fájlra.
3. Ha ellenőrizni akarod a projektet, futtasd a `PowerPlan-Tests.bat` fájlt.
4. Ha végeztél, futtasd a `PowerPlan-Stop.bat` fájlt.

## Projekt felépítése

- `Frontend/`: React + Vite kliensalkalmazás
- `Backend/`: Express API
- `db/`: adatbázis séma és mentések
- `docker-compose.yml`: teljes stack indítása Dockerrel

## Technológiai stack

- Frontend: React, Vite, Chart.js, Leaflet
- Backend: Node.js, Express, MySQL2, Nodemailer
- Adatbázis: MySQL 8
- Tesztelés:
  - Backend: Jest
  - Frontend E2E: Selenium WebDriver

## Alapértelmezett portok

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Backend health: `http://localhost:5001/api/health`
- phpMyAdmin: `http://localhost:8081`
- MySQL host port: `3308`

## Előfeltételek

### Dockeres futtatáshoz

- Docker Desktop
- Docker Compose

### Kézi futtatáshoz

- Node.js 20 körüli verzió
- npm
- Elérhető MySQL szerver
- Chrome böngésző a Selenium tesztekhez

## 1. Indítás Dockerrel

Ez a legegyszerűbb és javasolt mód.

### Egykattintásos indítás Windows alatt

Ha nem akarsz parancsokat kézzel futtatni, használd a projekt gyökerében lévő fájlokat:

- `PowerPlan-Start.bat`: elindítja a teljes stacket Dockerrel, megvárja a backendet, majd megnyitja a fontos URL-eket
- `PowerPlan-Stop.bat`: leállítja a teljes stacket
- `PowerPlan-Tests.bat`: lefuttatja a frontend buildet, a backend Jest teszteket és a frontend Selenium teszteket látható Google Chrome ablakban

Megjegyzés: a `PowerPlan-Tests.bat` használatához a Docker Desktopnak futnia kell, mert a Selenium tesztek a Dockeres adatbázist és backendet használják.

Használat:

1. Indítsd el a Docker Desktopot.
2. Kattints duplán a `PowerPlan-Start.bat` fájlra.
3. Ha kell, futtasd a `PowerPlan-Tests.bat` fájlt.
4. Leállításhoz kattints duplán a `PowerPlan-Stop.bat` fájlra.

### Indítás

Projekt gyökérből:

```powershell
docker compose up --build
```

Ha háttérben akarod futtatni:

```powershell
docker compose up --build -d
```

### Leállítás

```powershell
docker compose down
```

### Mit indít el a compose

- `db`: MySQL adatbázis
- `phpmyadmin`: adatbázis admin felület
- `backend`: Express API
- `frontend`: Vite fejlesztői szerver

### Fontos Docker részletek

- Az adatbázis konténer neve: `powerplan_db`
- A backend konténer belsőleg a `powerplan_db` hostot használja
- A host gépről a MySQL a `127.0.0.1:3308` címen érhető el

## 2. Indítás kézzel Docker nélkül

Ez akkor hasznos, ha külön akarod futtatni a szolgáltatásokat.

### 2.1 Adatbázis

Szükség van egy MySQL adatbázisra `powerplan` néven.

Ha Dockerben csak az adatbázist akarod indítani:

```powershell
docker compose up db phpmyadmin -d
```

Ebben az esetben a MySQL hostról így érhető el:

- host: `127.0.0.1`
- port: `3308`
- user: `root`
- password: `root`
- database: `powerplan`

### 2.2 Backend

Lépj be a backend mappába:

```powershell
cd Backend
```

Telepítés:

```powershell
npm install
```

Fejlesztői indítás:

```powershell
npm run dev
```

Normál indítás:

```powershell
npm start
```

### Fontos megjegyzés a `.env` fájlhoz

A jelenlegi [Backend/.env](Backend/.env) Dockeres futtatásra van beállítva:

- `DB_HOST=powerplan_db`

Ha host gépről, Docker nélkül indítod a backendet, ezt általában át kell írni erre:

```env
DB_HOST=127.0.0.1
DB_PORT=3308
DB_USER=root
DB_PASSWORD=root
DB_NAME=powerplan
PORT=5000
```

Megjegyzés:

- a backend a compose-ban `5000` belső portra indul
- a host gépen a compose `5001`-re mapeli ki

### 2.3 Frontend

Lépj be a frontend mappába:

```powershell
cd Frontend
```

Telepítés:

```powershell
npm install
```

Fejlesztői indítás:

```powershell
npm run dev
```

Build készítés:

```powershell
npm run build
```

Build preview:

```powershell
npm run preview
```

## 3. Gyors működésellenőrzés

### Backend health ellenőrzés

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5001/api/health | Select-Object StatusCode,Content
```

Elvárt válasz:

- `200`
- `{"ok":true,"service":"powerplan-backend"}`

### Frontend ellenőrzés

Nyisd meg:

- `http://localhost:5173`

### phpMyAdmin ellenőrzés

Nyisd meg:

- `http://localhost:8081`

## 4. Tesztek

### 4.1 Backend tesztek

A backend `package.json` jelenleg nem tartalmaz külön `test` scriptet, ezért a teszteket közvetlenül Jesttel kell futtatni.

Windows alatt ezek automatizáltan is futtathatók a projekt gyökeréből a `PowerPlan-Tests.bat` fájllal.

Lépj a backend mappába:

```powershell
cd Backend
```

Az ismert backend tesztek futtatása:

```powershell
npx jest test/services/nutritionHelpers.test.js test/services/workoutHelpers.test.js --runInBand
```

Ha minden Jest tesztet futtatnál:

```powershell
npx jest --runInBand
```

### 4.2 Frontend Selenium tesztek

Lépj a frontend mappába:

```powershell
cd Frontend
```

Összes Selenium teszt normál módban:

```powershell
npm run test:all
```

Összes Selenium teszt headless módban:

```powershell
npm run test:all:headless
```

Megjegyzések:

- a Selenium tesztekhez futó frontend és backend szükséges
- a tesztek Chrome/Chromedriver környezetet igényelnek

### 4.3 Frontend build ellenőrzés

```powershell
cd Frontend
npm run build
```

Ez jó első ellenőrzés minden frontend módosítás után.

## 5. Tipikus fejlesztői workflow

### Teljes rendszer indítása

```powershell
docker compose up --build
```

### Frontend módosítás után

```powershell
cd Frontend
npm run build
```

### Backend recommendation logika módosítás után

```powershell
cd Backend
npx jest test/services/nutritionHelpers.test.js test/services/workoutHelpers.test.js --runInBand
```

### E2E ellenőrzéshez

```powershell
cd Frontend
npm run test:all:headless
```

## 6. Gyakori hibák és megoldások

### A backend fut, de a böngészőben `Cannot GET /` látszik

Ez nem feltétlen portprobléma. A backend API elsősorban az `/api/...` útvonalakon érhető el.

Ellenőrizd inkább ezt:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5001/api/health
```

### A hostról nem éred el a MySQL-t `powerplan_db` néven

Ez normális. A `powerplan_db` Docker hálózaton belüli hostnév.

Host gépről ezt használd:

- host: `127.0.0.1`
- port: `3308`

### Új regisztráció után bizonyos dashboard adatok nem töltődnek

Ilyenkor ellenőrizd:

- van-e `powerplan_current_user` a localStorage-ben
- létrejött-e a `user_questionnaires` sor az adott userhez
- él-e a backend a `5001`-es porton

### A favicon vagy cím nem frissül

A böngésző gyakran cache-eli a favicon-t. Ilyenkor hard refresh kell.

### A frontend build figyelmeztet a nagy bundle méretre

Ez jelenleg ismert állapot:

- a build sikeres
- a chunk size warning nem blokkoló hiba

## 7. Hasznos URL-ek

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/api/health`
- Backend root: `http://localhost:5001/`
- phpMyAdmin: `http://localhost:8081`

## 8. Jelszó-visszaállítás email konfiguráció

A jelszó-visszaállítás SMTP beállításokat igényel a backend oldalon.

Használható változók:

- `SMTP_SERVICE` vagy `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

A rendszer ideiglenes jelszót küld emailben, majd a felhasználó ezt a Profil oldalon módosíthatja.

## 9. Résztvevők

- Tóth Márton Máté
- Pajor Alex

## 10. Megjegyzés

Ez a projekt a szoftverfejlesztő és tesztelő képzés záróvizsgájának részeként készült.
