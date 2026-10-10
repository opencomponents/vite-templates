import { test, expect } from '@playwright/test';

// Keep in sync with COMPONENTS in e2e/registry.js.
const TEMPLATES = ['react', 'es6', 'solid', 'vue', 'svelte', 'preact', 'elm'];

const EXPECTED = {
  firstName: 'Jane',
  lastName: 'Doe',
  born: '1991',
  hobbies: 'running, rugby',
  funFact: 'The first web page was created in 1991 by Tim Berners-Lee.',
};

for (const template of TEMPLATES) {
  test(`renders ${template} and serves fun fact`, async ({ page }) => {
    await page.goto(
      `/base-component-${template}/1.0.0/~preview?userId=1`,
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
    await funFactButton.click();

    // Client-side action round-trip; auto-retries until hydration + fetch complete.
    await expect(page.getByText(EXPECTED.funFact)).toBeVisible();
  });
}
