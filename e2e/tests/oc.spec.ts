import { test, expect } from '@playwright/test';

// Keep in sync with COMPONENTS in e2e/registry.js.
const TEMPLATES = [
  'react',
  'es6',
  'solid',
  'vue',
  'svelte',
  'preact',
  'elm',
  'esm.react',
  'esm.remix',
];

const EXPECTED = {
  name: 'Jane Doe',
  born: 'Born in 1991',
  funFact: 'The first web page was created in 1991 by Tim Berners-Lee.',
  // Every template uses the same palette: card #ffffff, button #4f46e5.
  cardBackground: 'rgb(255, 255, 255)',
  buttonBackground: 'rgb(79, 70, 229)',
};

for (const template of TEMPLATES) {
  // The served URL derives from the staged package.json name, where dots
  // are normalized to dashes (see registry.js).
  const urlName = `base-component-${template.replace(/\./g, '-')}`;
  test(`renders ${template} and serves fun fact`, async ({ page }) => {
    await page.goto(
      `/${urlName}/1.0.0/~preview?name=Jane%20Doe&year=1991`,
      { waitUntil: 'domcontentloaded' }
    );

    // Initial server-rendered data (from the handler return value).
    await expect(
      page.getByRole('heading', { name: `Hello, ${EXPECTED.name}` })
    ).toBeVisible();
    await expect(page.getByText(EXPECTED.born)).toBeVisible();

    const funFactButton = page.getByRole('button', {
      name: 'Fun year fact',
    });
    await expect(funFactButton).toBeVisible();

    // The component CSS must be bundled and applied: card and button
    // come from per-template stylesheets, so these fail loudly when CSS
    // bundling/injection breaks for a template. Unlike screenshots, computed
    // styles are identical across OSes and browsers.
    const card = page
      .getByRole('heading', { name: /Hello/ })
      .locator('..');
    await expect(card).toHaveCSS('background-color', EXPECTED.cardBackground);
    await expect(funFactButton).toHaveCSS(
      'background-color',
      EXPECTED.buttonBackground
    );

    await expect(page).toHaveScreenshot(`${template}-initial.png`);

    await funFactButton.click();

    // Client-side action round-trip; auto-retries until hydration + fetch complete.
    await expect(page.getByText(EXPECTED.funFact)).toBeVisible();

    await expect(page).toHaveScreenshot(`${template}-fun-fact.png`);
  });
}
