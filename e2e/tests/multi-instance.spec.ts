import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// A page can mount the same ESM component version more than once with
// different parameters; each instance must keep its own initial data
// (getInitialData) and settings (getSettings, serverClient).
const TEMPLATES = ['esm.react', 'esm.remix', 'esm.effect'];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('esm: mounted instances keep their own initial data and settings', async () => {
  // Build the fixture with the esm compiler staged by registry.js, from inside
  // a staged component so its dependencies resolve.
  const componentDir = path.join(
    __dirname,
    '../build/base-component-esm-react'
  );
  const fixtureDir = path.join(componentDir, '.multi-instance-fixture');
  const publishPath = path.join(fixtureDir, '_package');
  await fs.rm(fixtureDir, { recursive: true, force: true });
  await fs.cp(path.join(__dirname, '../fixtures/multi-instance'), fixtureDir, {
    recursive: true,
  });
  const { compile } = await import(
    pathToFileURL(
      path.join(
        componentDir,
        'node_modules/oc-template-esm-compiler/dist/lib/compile.js'
      )
    ).href
  );
  const componentPackage = JSON.parse(
    await fs.readFile(path.join(fixtureDir, 'package.json'), 'utf8')
  );
  await new Promise<void>((resolve, reject) =>
    compile(
      {
        componentPackage,
        componentPath: fixtureDir,
        ocPackage: { name: 'oc', version: '0.50.64' },
        production: true,
        publishPath,
        verbose: false,
        watch: false,
      },
      (err: Error | null) => (err ? reject(err) : resolve())
    )
  );

  const globals = globalThis as { document?: unknown };
  globals.document ??= { getElementById: () => null };
  const { mount } = await import(
    pathToFileURL(path.join(publishPath, 'template.js')).href
  );
  const element = (id: string) => ({
    result: undefined as unknown,
    getAttribute: (name: string) => (name === 'id' ? id : null),
  });
  const first = element('first');
  const second = element('second');
  mount(first, { name: 'Jane', _componentName: 'multi-instance-fixture' });
  mount(second, { name: 'Ada', _componentName: 'multi-instance-fixture' });
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(first.result).toEqual({ name: 'Jane', id: 'first', mounts: 1 });
  expect(second.result).toEqual({ name: 'Ada', id: 'second', mounts: 1 });
});

const FIRST = {
  name: 'Jane Doe',
  fact: 'The first web page was created in 1991 by Tim Berners-Lee.',
};
const SECOND = {
  name: 'Ada Lovelace',
  fact: "Halley's Comet made its closest approach to Earth in 1986.",
};

for (const template of TEMPLATES) {
  const urlName = `base-component-${template.replace(/\./g, '-')}`;
  test(`${template}: instances on one page keep their own data`, async ({
    page,
  }) => {
    await page.goto(`/${urlName}/1.0.0/~preview?name=Jane%20Doe&year=1991`, {
      waitUntil: 'domcontentloaded',
    });
    const instances = page.locator('oc-component');
    await expect(
      instances.first().getByRole('heading', { name: `Hello, ${FIRST.name}` })
    ).toBeVisible();

    // Mount two more instances in the same tick, so both mounts happen before
    // either renders.
    await page.evaluate(() => {
      const preview = document.querySelector('oc-component')!;
      const href = preview.getAttribute('href')!;
      for (const query of [
        '?name=Jane%20Doe&year=1991',
        '?name=Ada%20Lovelace&year=1986',
      ]) {
        const instance = document.createElement('oc-component');
        instance.setAttribute('href', href.replace(/\?.*$/, query));
        document.body.appendChild(instance);
      }
      preview.remove();
      (
        window as unknown as { oc: { renderUnloadedComponents(): void } }
      ).oc.renderUnloadedComponents();
    });

    const first = instances.nth(0);
    const second = instances.nth(1);
    await expect(
      first.getByRole('heading', { name: `Hello, ${FIRST.name}` })
    ).toBeVisible();
    await expect(
      second.getByRole('heading', { name: `Hello, ${SECOND.name}` })
    ).toBeVisible();

    await first.getByRole('button', { name: 'Fun year fact' }).click();
    await expect(first.getByText(FIRST.fact)).toBeVisible();
    await expect(
      first.getByRole('heading', { name: `Hello, ${FIRST.name}` })
    ).toBeVisible();

    await second.getByRole('button', { name: 'Fun year fact' }).click();
    await expect(second.getByText(SECOND.fact)).toBeVisible();
    await expect(
      second.getByRole('heading', { name: `Hello, ${SECOND.name}` })
    ).toBeVisible();
  });
}
