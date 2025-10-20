#!/usr/bin/env node

import prompts from 'prompts';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const MIN_NODE_VERSION = 20;
function checkNodeVersion() {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].slice(1));
  if (major < MIN_NODE_VERSION) {
    console.error(`Node.js version ${MIN_NODE_VERSION} or higher is required`);
    process.exit(1);
  }
}

function createOcJson(cwd, importmap) {
  let oc = {};
  try {
    oc = fs.readFileSync(path.join(cwd, 'oc.json'), 'utf-8');
  } catch {}

  if (!oc.$schema) {
    oc.$schema = 'https://opencomponents.github.io/schema.json';
  }
  oc.importmap = oc.importmap?.imports
    ? {
        imports: {
          ...oc.importmap.imports,
          ...importmap,
        },
      }
    : importmap;

  fs.writeFileSync(
    path.join(cwd, 'oc.json'),
    JSON.stringify(oc, null, 2),
    'utf-8'
  );
}

checkNodeVersion();

const templateChoices = [
  { title: 'Vanilla', value: 'es6' },
  { title: 'React', value: 'react' },
  { title: 'Solid', value: 'solid' },
  { title: 'Preact', value: 'preact' },
  { title: 'Vue', value: 'vue' },
  { title: 'Svelte', value: 'svelte' },
  { title: 'Elm', value: 'elm' },
  { title: 'ESM (Beta)', value: 'esm' },
];
const templates = templateChoices.map((t) => t.value);

const esmVariantChoices = [
  { title: 'React', value: 'esm.react' },
  { title: 'Remix (Experimental)', value: 'esm.remix' },
];
const esmVariants = esmVariantChoices.map((t) => t.value);

let {
  values: { name: componentName, template },
} = parseArgs({
  args: process.argv.slice(2),
  options: {
    name: {
      type: 'string',
    },
    template: {
      type: 'string',
    },
  },
});
// Check if template is a valid ESM variant
if (template && esmVariants.includes(template)) {
  // Template is already a specific ESM variant, keep it
} else if (template && !templates.includes(template)) {
  template = null;
}

let answers = await prompts([
  {
    type: componentName ? null : 'text',
    name: 'componentName',
    message: 'Component name',
    initial: 'oc-component',
  },
  {
    type: template ? null : 'select',
    name: 'template',
    message: 'Select a template',
    choices: templateChoices,
  },
]);

if (!componentName) {
  componentName = answers.componentName;
}
if (!template) {
  template = answers.template;
}

// If ESM was selected, show submenu for variants
if (template === 'esm') {
  const variantAnswer = await prompts({
    type: 'select',
    name: 'variant',
    message: 'Select ESM variant',
    choices: esmVariantChoices,
  });

  if (!variantAnswer.variant) {
    process.exit(1);
  }

  template = variantAnswer.variant;
}

if (!componentName || !template) {
  process.exit(1);
}

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

const imports = (() => {
  switch (template) {
    case 'esm.react':
      return {
        react: 'https://esm.sh/react@19.1.0',
        'react-dom': 'https://esm.sh/react-dom@19.1.0',
        'react-dom/': 'https://esm.sh/react-dom@19.1.0/',
      };
    case 'esm.remix':
      return {
        '@remix-run/dom':
          'https://esm.sh/@remix-run/dom@0.0.0-experimental-remix-jam.6',
        '@remix-run/events':
          'https://esm.sh/@remix-run/events@0.0.0-experimental-remix-jam.5',
        '@remix-run/events/':
          'https://esm.sh/@remix-run/events@0.0.0-experimental-remix-jam.5/',
      };
    default:
      return undefined;
  }
})();

createOcJson(process.cwd(), imports ? { imports } : undefined);

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
