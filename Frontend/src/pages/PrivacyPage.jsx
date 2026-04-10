import React from 'react';
import './LegalPages.css';

function PrivacyPage({ navigateTo }) {
  return (
    <div className="legal-page">
      <div className="legal-shell">
        <a href="#" className="legal-back-link" onClick={(e) => { e.preventDefault(); navigateTo('registration'); }}>
          <i className="fas fa-arrow-left"></i> Vissza a regisztrációhoz
        </a>
        <div className="legal-header">
          <h1>Adatvédelmi Nyilatkozat</h1>
          <p>
            Jelen adatvédelmi nyilatkozat azt ismerteti, hogy a Power Plan milyen személyes és
            használati adatokat kezel, milyen célból teszi ezt, milyen jogalapokra támaszkodik,
            valamint milyen jogok illetik meg a felhasználókat az adatkezeléssel összefüggésben.
          </p>
        </div>

        <section className="legal-section">
          <h2>1. Kezelt adatok köre</h2>
          <p>
            A szolgáltatás keretében kezelhetjük a regisztráció során megadott azonosító adatokat,
            így különösen a nevet, az email címet, a bejelentkezéshez kapcsolódó technikai adatokat,
            valamint a felhasználó által önkéntesen rögzített fitnesz- és életmódadatokat.
          </p>
          <p>
            Ide tartozhatnak például a kérdőívre adott válaszok, edzéstervhez kapcsolódó adatok,
            naplózott gyakorlatok, testsúlyváltozások, étkezési bejegyzések, illetve a felhasználói
            felület használatából származó technikai információk.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Az adatkezelés célja</h2>
          <p>Az adatkezelés célja különösen az alábbiak biztosítása:</p>
          <ul>
            <li>felhasználói fiók létrehozása és a bejelentkezés biztosítása,</li>
            <li>személyre szabott edzés- és életmódfunkciók nyújtása,</li>
            <li>haladáskövetés, statisztikák és naplóbejegyzések megjelenítése,</li>
            <li>a szolgáltatás technikai működésének fenntartása, hibák kezelése és fejlesztés,</li>
            <li>szükség esetén kapcsolattartás a felhasználóval.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Az adatkezelés jogalapja</h2>
          <p>
            Az adatkezelés jogalapja elsősorban a szolgáltatás nyújtásához szükséges szerződéses
            teljesítés, a felhasználó hozzájárulása, valamint egyes esetekben a szolgáltató jogos
            érdeke a rendszer biztonságának, fejlesztésének és védelmének fenntartására.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Adatmegőrzés időtartama</h2>
          <p>
            A személyes adatokat csak addig őrizzük meg, ameddig az a felhasználói fiók működéséhez,
            a szolgáltatás biztosításához, jogi kötelezettség teljesítéséhez vagy jogos érdek
            érvényesítéséhez szükséges. A megőrzési idő a kezelt adatok jellegétől függően eltérő lehet.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Adatbiztonság</h2>
          <p>
            Megfelelő technikai és szervezési intézkedéseket alkalmazunk annak érdekében, hogy az
            adatokat megóvjuk a jogosulatlan hozzáféréstől, megváltoztatástól, nyilvánosságra
            hozataltól, törléstől vagy megsemmisüléstől. Ezek az intézkedések azonban a digitális
            környezet sajátosságai miatt teljes körű kockázatmentességet nem tudnak garantálni.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Adattovábbítás és hozzáférés</h2>
          <p>
            A szolgáltató a személyes adatokat harmadik fél részére kizárólag jogszerű esetben,
            megfelelő garanciák mellett és csak a szükséges mértékben továbbítja. Bizonyos technikai
            közreműködők vagy tárhelyszolgáltatók a rendszer működtetésében részt vehetnek.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. A felhasználó jogai</h2>
          <p>
            A felhasználó jogosult tájékoztatást kérni a róla kezelt adatokról, kérheti azok
            helyesbítését, törlését, kezelésének korlátozását, valamint élhet adathordozhatósági és
            tiltakozási jogával az alkalmazandó jogszabályoknak megfelelően.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Sütik és technikai adatok</h2>
          <p>
            A szolgáltatás működése során bizonyos technikai adatok, például munkamenethez kötődő
            információk vagy helyi tárolóban elhelyezett beállítások felhasználásra kerülhetnek a
            belépés, a felhasználói élmény és az alkalmazás működésének biztosítása érdekében.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Kapcsolat és jogérvényesítés</h2>
          <p>
            Adatkezeléssel kapcsolatos kérdés esetén a felhasználó a szolgáltató kapcsolatfelvételi
            csatornáin fordulhat hozzánk. A felhasználót megilletik a vonatkozó adatvédelmi jogszabályok
            szerinti jogorvoslati lehetőségek is.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;