import React from 'react';
import './LegalPages.css';

function TermsPage({ navigateTo }) {
  return (
    <div className="legal-page">
      <div className="legal-shell">
        <a href="#" className="legal-back-link" onClick={(e) => { e.preventDefault(); navigateTo('regisztracio'); }}>
          <i className="fas fa-arrow-left"></i> Vissza a regisztrációhoz
        </a>
        <div className="legal-header">
          <h1>Felhasználási Feltételek</h1>
          <p>
            Jelen felhasználási feltételek a Power Plan weboldal, a hozzá kapcsolódó regisztrációs,
            bejelentkezési, kérdőíves, edzésnaplózó és táplálkozáskövető funkciók használatára
            vonatkoznak. Az oldal használatával Ön kijelenti, hogy a feltételeket megismerte,
            megértette, és azokat magára nézve kötelezőnek fogadja el.
          </p>
        </div>

        <section className="legal-section">
          <h2>1. A szolgáltatás célja és jellege</h2>
          <p>
            A Power Plan célja, hogy digitális támogatást nyújtson a felhasználók számára az
            edzés, a fejlődéskövetés, a táplálkozási naplózás és az általános életmódtervezés
            területén. A szolgáltatás információs és szervezési eszköz, amely segítheti a
            felhasználót saját céljai követésében, azonban nem helyettesíti az orvosi,
            dietetikai, fizioterápiás vagy személyi edzői szakvéleményt.
          </p>
          <p>
            A rendszerben megjelenő ajánlások, napi összesítések, edzéstervek, grafikonok és
            egyéb statisztikák tájékoztató jellegűek. A felhasználó saját felelősségére dönti el,
            hogy az oldalon elérhető információkat milyen mértékben alkalmazza a gyakorlatban.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Felhasználói fiók és regisztráció</h2>
          <p>
            A szolgáltatás egyes részei kizárólag regisztrált felhasználók számára érhetők el.
            A regisztráció során a felhasználó köteles valós, pontos és aktuális adatokat megadni.
            A szolgáltató jogosult a nyilvánvalóan valótlan, megtévesztő vagy visszaélésszerű
            regisztrációk korlátozására vagy törlésére.
          </p>
          <p>
            A felhasználó felel a belépési adatainak bizalmas kezeléséért, valamint minden olyan
            tevékenységért, amely a fiókján keresztül történik. Ha a felhasználó illetéktelen
            hozzáférést vagy biztonsági incidenst észlel, köteles azt haladéktalanul jelezni.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Elfogadható használat</h2>
          <p>
            A szolgáltatás kizárólag jogszerű, tisztességes és rendeltetésszerű célokra használható.
            A felhasználó nem jogosult a rendszert olyan módon használni, amely más felhasználók,
            a szolgáltató vagy harmadik felek jogait sérti, vagy a rendszer működését hátrányosan
            befolyásolja.
          </p>
          <ul>
            <li>Tilos a rendszer károsítása, túlterhelése, visszafejtése vagy jogosulatlan elérése.</li>
            <li>Tilos más személy adataival visszaélni, más nevében regisztrálni vagy hamis adatokat megadni.</li>
            <li>Tilos a felületen megjelenő tartalmakat vagy funkciókat automatizált módon visszaélésszerűen használni.</li>
            <li>Tilos a szolgáltatást olyan célra használni, amely jogszabályba ütközik vagy másokat sért.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Egészségügyi és szakmai felelősség</h2>
          <p>
            A Power Plan nem vállal felelősséget olyan sérülésért, egészségromlásért vagy egyéb
            káreseményért, amely abból ered, hogy a felhasználó az itt található információk,
            edzésajánlások vagy táplálkozási bejegyzések alapján hoz döntést anélkül, hogy saját
            egészségi állapotát vagy szakember javaslatát figyelembe venné.
          </p>
          <p>
            A felhasználó köteles meggyőződni arról, hogy az általa végzett gyakorlatok, étrendi
            változtatások és egyéb életmódbeli döntések megfelelőek a saját fizikai állapotához,
            terhelhetőségéhez és egészségügyi helyzetéhez.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Szellemi tulajdon és tartalomhasználat</h2>
          <p>
            A Power Plan arculata, szöveges tartalmai, felépítése, kezelőfelülete, fejlesztett
            funkciói és egyéb megjelenített elemei szerzői jogi vagy egyéb jogi védelem alatt
            állhatnak. A szolgáltatás tartalmának engedély nélküli másolása, terjesztése,
            módosítása vagy üzleti célú felhasználása nem megengedett.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Szolgáltatás elérhetősége</h2>
          <p>
            A szolgáltató törekszik arra, hogy a felület folyamatosan és stabilan elérhető legyen,
            de nem garantálja a megszakításmentes működést. Karbantartás, frissítés, technikai hiba,
            harmadik fél szolgáltatásának hibája vagy hálózati probléma esetén előfordulhat
            részleges vagy teljes kiesés.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Fiók korlátozása vagy megszüntetése</h2>
          <p>
            A szolgáltató jogosult a felhasználói fiókhoz való hozzáférést ideiglenesen vagy
            véglegesen korlátozni, ha a felhasználó megsérti a jelen feltételeket, visszaélésszerűen
            használja a rendszert, vagy olyan magatartást tanúsít, amely a szolgáltatás biztonságát
            vagy működését veszélyezteti.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Feltételek módosítása</h2>
          <p>
            A jelen felhasználási feltételek időről időre frissülhetnek. A módosított verzió a
            közzététel időpontjától hatályos. A szolgáltatás további használata a módosított feltételek
            elfogadásának minősül.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Kapcsolat</h2>
          <p>
            A feltételekkel kapcsolatos kérdés, észrevétel vagy megkeresés esetén a felhasználó a
            Power Plan hivatalos kapcsolatfelvételi csatornáin keresztül fordulhat a szolgáltatóhoz.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;