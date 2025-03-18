import fs from 'fs';
import pkg from 'oc';
import { $ } from 'execa';

const { cli } = pkg;

async function initialize(component, clean = false) {
  fs.cpSync(
    `../packages/create-oc/templates/${component}`,
    `./build/base-component-${component}`,
    {
      recursive: true,
    }
  );
  if (clean) {
    console.log(`Installing packages for ${component}`);
    await $({
      cwd: `./build/base-component-${component}`,
      stdio: 'inherit',
    })`npm install`;
  }
  fs.cpSync(
    `../packages/oc-template-${component}/dist`,
    `./build/base-component-${component}/node_modules/oc-template-${component}/dist`,
    {
      force: true,
      recursive: true,
    }
  );
  fs.cpSync(
    `../packages/oc-template-${component}-compiler/dist`,
    `./build/base-component-${component}/node_modules/oc-template-${component}-compiler/dist`,
    {
      force: true,
      recursive: true,
    }
  );
  fs.cpSync(
    '../packages/oc-vite-compiler/dist',
    `./build/base-component-${component}/node_modules/oc-vite-compiler/dist`,
    {
      force: true,
      recursive: true,
    }
  );
  fs.cpSync(
    '../packages/oc-vite/dist',
    `./build/base-component-${component}/node_modules/oc-vite/dist`,
    {
      force: true,
      recursive: true,
    }
  );
  fs.cpSync(
    '../packages/oc-server/dist',
    `./build/base-component-${component}/node_modules/oc-server/dist`,
    {
      force: true,
      recursive: true,
    }
  );
}

async function start(clean = false) {
  if (clean) {
    fs.rmSync('./build', { recursive: true, force: true });
  }
  const components = [
    'react',
    'es6',
    'solid',
    'vue',
    'svelte' /*'preact', 'elm' */,
  ];

  console.log('Initializing components');
  for (const component of components) {
    await initialize(component, clean);
  }

  console.log('Starting dev server');
  cli.dev(
    {
      components: components.map((c) => `base-component-${c}`),
      dirPath: './build',
      logger: {
        ok: console.log,
        error: console.error,
        log: console.info,
        warn: console.warn,
      },
    },
    (err, res) => {
      process.on('SIGINT', () =>
        res.close(() => {
          console.log('Server closed');
          process.exit(0);
        })
      );
    }
  );
}

const clean = process.argv[2] === 'clean';
start(clean).catch(console.error);
