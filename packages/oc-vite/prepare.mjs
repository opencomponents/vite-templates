import { promisify } from 'node:util';
import child_process from 'node:child_process';
import fs from 'fs';
import Module from 'node:module';
const require = Module.createRequire(import.meta.url);

const equal = require('./deepEqual.cjs');

const exec = promisify(child_process.exec);
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const pkgJson = readJSON('./package.json', 'utf-8');
const rmDir = (path) => {
  try {
    fs.rmSync(path, { recursive: true });
  } catch {
    // Empty
  }
};

/**
 * Check before publishing that the fields of package.json are equal to the ones
 * in the vite package
 * @param {*} pkgJson
 * @param {*} vitePkgJson
 */
function checkPackages(pkgJson, vitePkgJson) {
  const fields = [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'engines',
    'license',
    'author',
    'keywords',
    'exports',
  ];
  const differences = [];

  for (const field of fields) {
    const pkg = pkgJson[field];
    const vitePkg = vitePkgJson[field];

    if (!equal(pkg, vitePkg)) {
      differences.push({ field, differences: { pkg, vitePkg } });
    }
  }

  if (differences.length) {
    throw new Error(JSON.stringify(differences, null, 2));
  }
}

/**
 * Remove condition of always inlining assets on build mode
 * @param {string} file
 */
function fixBuild(path) {
  const file = fs.readFileSync(path, 'utf-8');

  const buildCondition = 'if (environment.config.build.lib) return true';

  if (file.split(buildCondition).length !== 2) {
    throw new Error(
      'Source code does not match expectations for automatic replacement of condition'
    );
  }

  const fixedBuild = file.replace(buildCondition, '');

  fs.writeFileSync(path, fixedBuild, 'utf-8');
}

/**
 * Amplify rollup to add 10 more kbs to the limit
 * @param {string} file
 */
function fixRollup(path) {
  const file = fs.readFileSync(path, 'utf-8');

  const buildCondition = /bundleSizeLimit\((\d+)\)/;

  if (!file.match(buildCondition)) {
    throw new Error(
      'Source code does not match expectations for automatic replacement of rollup limit'
    );
  }

  const fixedBuild = file.replace(buildCondition, (match, limit) =>
    match.replace(limit, Number(limit) + 10)
  );

  fs.writeFileSync(path, fixedBuild, 'utf-8');
}

/**
 * Add the OC globals (oc-client.d.ts) to vite's client types and type plain
 * .css imports as CSS modules, since the compilers treat them as such
 * @param {string} path
 */
function fixClientTypes(path) {
  const file = fs.readFileSync(path, 'utf-8');
  const reference = '/// <reference path="./types/importMeta.d.ts" />\n';
  const cssDeclaration = "declare module '*.css' {}\n";
  const cssModulesDeclaration =
    "// CSS modules\ntype CSSModuleClasses = { readonly [key: string]: string }\n";

  if (
    !file.startsWith(reference) ||
    file.split(cssDeclaration).length !== 2 ||
    file.split(cssModulesDeclaration).length !== 2
  ) {
    throw new Error(
      'Source code does not match expectations for automatic replacement of client types'
    );
  }

  const ocTypes = fs.readFileSync('./oc-client.d.ts', 'utf-8');
  const fixedTypes = file
    .replace(reference, `${reference}\n${ocTypes}\n`)
    .replace(cssDeclaration, '')
    .replace(
      cssModulesDeclaration,
      `${cssModulesDeclaration}\ndeclare module '*.css' {\n  const classes: CSSModuleClasses\n  export default classes\n}\n`
    );

  fs.writeFileSync(path, fixedTypes, 'utf-8');
}

/**
 * Vite imports its own module runner by package name, which would resolve to
 * whichever "vite" is installed next to oc-vite instead of this build
 * @param {string} dir
 */
function fixSelfImports(dir) {
  const selfImport = /(["'])vite\/module-runner\1/g;
  let replaced = 0;

  for (const entry of fs.readdirSync(dir, { recursive: true })) {
    const path = `${dir}/${entry}`;
    if (!/\.(js|d\.ts)$/.test(path)) continue;
    const file = fs.readFileSync(path, 'utf-8');
    const fixed = file.replace(selfImport, (_, quote) => {
      replaced++;
      return `${quote}oc-vite/module-runner${quote}`;
    });
    if (fixed !== file) fs.writeFileSync(path, fixed, 'utf-8');
  }

  if (!replaced) {
    throw new Error(
      'Source code does not match expectations for automatic replacement of self imports'
    );
  }
}

async function checkPreviousBuild() {
  try {
    const vitePackageJson = readJSON('./vite/packages/vite/package.json');

    return vitePackageJson.version === pkgJson.viteVersion;
  } catch {
    return false;
  }
}

async function main() {
  const wasBuilt = await checkPreviousBuild();
  if (wasBuilt) {
    console.log('Build already in place');
    process.exit(0);
  }

  rmDir('./bin');
  rmDir('./dist');
  rmDir('./types');
  rmDir('./vite');

  console.log('Cloning repository');
  await exec('git clone https://github.com/vitejs/vite.git');
  await exec(`git checkout v${pkgJson.viteVersion}`, { cwd: './vite' });
  rmDir('./vite/.git');

  console.log('Checking package jsons');
  const vitePkgJson = await readJSON('./vite/packages/vite/package.json');
  checkPackages(pkgJson, vitePkgJson);

  console.log('Installing');
  // The clone has no .git, so vite's simple-git-hooks would install its
  // pre-commit hook into this repository instead
  await exec('pnpm install', {
    cwd: './vite/packages/vite',
    env: { ...process.env, SKIP_INSTALL_SIMPLE_GIT_HOOKS: '1' },
  });

  console.log('Building');
  fixBuild('./vite/packages/vite/src/node/plugins/asset.ts');
  fixRollup('./vite/packages/vite/rolldown.config.ts');
  await exec('pnpm build', { cwd: './vite/packages/vite' });

  console.log('Moving folders');
  fs.renameSync('./vite/packages/vite/dist', './dist');
  fs.renameSync('./vite/packages/vite/bin', './bin');
  fs.renameSync('./vite/packages/vite/types', './types');
  fs.renameSync('./vite/packages/vite/client.d.ts', './client.d.ts');

  console.log('Fixing published files');
  fixClientTypes('./client.d.ts');
  fixSelfImports('./dist/node');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
