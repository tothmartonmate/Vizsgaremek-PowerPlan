import {
  assert,
  buildDriver,
  By,
  clickSidebarSection,
  ensureLoggedIn,
  waitForTitle,
  waitForVisible
} from './helpers.js';

export const suiteName = 'Dashboard';

export async function runSuite(runCase, sharedDriver) {
  const driver = sharedDriver || await buildDriver();
  const ownsDriver = !sharedDriver;

  try {
    await ensureLoggedIn(driver);
    await clickSidebarSection(driver, 'Dashboard');

    await runCase('A Dashboard oldal címe helyesen jelenik meg', async () => {
      await waitForTitle(driver, 'Dashboard');
      assert.ok(await waitForVisible(driver, By.css('.content-section.active')));
    });

    await runCase('A Dashboard alcíme az üdvözlő szöveget mutatja', async () => {
      const subtitle = await waitForVisible(driver, By.css('.page-title p span'));
      assert.equal((await subtitle.getText()).trim(), 'Üdvözöljük!');
    });

    await runCase('A fő üdvözlő kártya látszik a felhasználónak', async () => {
      const welcomeHeading = await waitForVisible(driver, By.css('.content-section.active .card h2'));
      assert.ok((await welcomeHeading.getText()).includes('Üdvözöljük'));
    });

    await runCase('Az AI ajánlás blokk megjelenik a dashboardon', async () => {
      assert.ok(await waitForVisible(driver, By.css('.ai-box')));
      assert.ok(await waitForVisible(driver, By.xpath("//h3[contains(., 'Ajánlás:')]")));
    });

    await runCase('A dashboard legalább három statisztikai kártyát mutat', async () => {
      const statCards = await driver.findElements(By.css('.stats-grid .stat-card'));
      assert.ok(statCards.length >= 3);
    });

    await runCase('Az EDZÉSEK statisztika felirata látszik', async () => {
      assert.ok(await waitForVisible(driver, By.xpath("//div[contains(@class,'stat-info')][.//h3[normalize-space()='EDZÉSEK']]")));
    });

    await runCase('A KALÓRIA statisztika és a progress bar is látszik', async () => {
      const calorieCard = await waitForVisible(driver, By.css('.stats-grid .stat-card:nth-child(2)'));
      const calorieLabel = await calorieCard.findElement(By.css('.stat-info h3'));
      assert.equal((await calorieLabel.getText()).trim(), 'KALÓRIA');
      const progressFill = await calorieCard.findElement(By.css('.progress-fill'));
      const widthStyle = await progressFill.getAttribute('style');
      assert.ok(widthStyle.includes('width'));
    });

    await runCase('A TESTSULY statisztika felirata látszik', async () => {
      assert.ok(await waitForVisible(driver, By.xpath("//div[contains(@class,'stat-info')][.//h3[normalize-space()='TESTSULY']]")));
    });

    await runCase('Az oldalsáv felhasználó blokkja nem üres', async () => {
      const userName = await waitForVisible(driver, By.css('.user-profile .user-name'));
      assert.ok((await userName.getText()).trim().length > 0);
    });

    await runCase('A dashboard grafikonjai és címei megjelennek', async () => {
      assert.ok(await waitForVisible(driver, By.xpath("//h3[normalize-space()='Súlyfejlődés']")));
      assert.ok(await waitForVisible(driver, By.xpath("//h3[normalize-space()='Edzési gyakoriság']")));
      const charts = await driver.findElements(By.css('.charts-grid canvas'));
      assert.ok(charts.length >= 2);
    });
  } finally {
    if (ownsDriver) {
      await driver.quit();
    }
  }
}