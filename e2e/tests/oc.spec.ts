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
  firstName: 'Jane',
  lastName: 'Doe',
  born: '1991',
  hobbies: 'running, rugby',
  funFact: 'The first web page was created in 1991 by Tim Berners-Lee.',
  // Every template uses the same palette: container #3b246c, button #a97613.
  containerBackground: 'rgb(59, 36, 108)',
  buttonBackground: 'rgb(169, 118, 19)',
};

for (const template of TEMPLATES) {
  // The served URL derives from the staged package.json name, where dots
  // are normalized to dashes (see registry.js).
  const urlName = `base-component-${template.replace(/\./g, '-')}`;
  test(`renders ${template} and serves fun fact`, async ({ page }) => {
    await page.goto(
      `/${urlName}/1.0.0/~preview?userId=1`,
      { waitUntil: 'domcontentloaded' }
    );

    // Initial server-rendered data (deterministic for userId=1).
    await expect(page.getByText(EXPECTED.firstName)).toBeVisible();
    await expect(page.getByText(EXPECTED.lastName)).toBeVisible();
    await expect(
      page.getByText(`Born: ${EXPECTED.born}`)
    ).toBeVisible();
    await expect(
      page.getByText(`Hobbies: ${EXPECTED.hobbies}`)
    ).toBeVisible();

    const funFactButton = page.getByRole('button', {
      name: 'Fun year fact',
    });
    await expect(funFactButton).toBeVisible();

    // The component CSS must be bundled and applied: container and button
    // come from per-template stylesheets, so these fail loudly when CSS
    // bundling/injection breaks for a template. Unlike screenshots, computed
    // styles are identical across OSes and browsers.
    const container = page
      .getByRole('heading', { name: /Hello/ })
      .locator('..');
    await expect(container).toHaveCSS(
      'background-color',
      EXPECTED.containerBackground
    );
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
