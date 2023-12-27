#!/usr/bin/env node

import prompts from 'prompts';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const { componentName, template } = await prompts([
  {
    type: 'text',
    name: 'componentName',
    message: 'Component name',
    initial: 'oc-component',
  },
  {
    type: 'select',
    name: 'template',
    message: 'Select a template',
    choices: [
      { title: 'Vanilla', value: 'es6' },
      { title: 'React', value: 'react' },
      { title: 'Solid', value: 'solid' },
      { title: 'Preact', value: 'preact' },
      { title: 'Elm', value: 'elm' },
    ],
  },
]);

try {
  fs.mkdirSync(`./${componentName}`);
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('Folder already exists');
    process.exit(1);
  }
  throw err;
}

const templateDir = path.resolve(
  fileURLToPath(import.meta.url),
  `../templates/${template}`
);

console.log();
console.log('Creating the template');
fs.cpSync(templateDir, `./${componentName}`, {
  recursive: true,
});
fs.writeFileSync(
  `./${componentName}/.gitignore`,
  ['node_modules', '_package'].join('\n'),
  'utf-8'
);
replaceJson(`./${componentName}/package.json`, (pkg) => ({
  ...pkg,
  name: componentName,
  scripts: {
    ...(pkg.scripts || {}),
    start: `oc dev .. --components ${componentName}`,
  },
}));

console.log('Finished. To start your oc for the first time:');
console.log();
console.log(`  cd ${componentName}`);
console.log('  npm install');
console.log('  npm start');

function replaceJson(file, transformer) {
  const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const transformed = transformer(json);
  fs.writeFileSync(file, JSON.stringify(transformed, null, 2), 'utf-8');
}
