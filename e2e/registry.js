import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'oc';
import { execa } from 'execa';

const { cli } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// The templates covered by e2e. Keep in sync with e2e/tests/oc.spec.ts.
// Covers every stable template scaffolded by create-oc (ESM variants are beta, excluded).
const COMPONENTS = [
  'react',
  'es6',
  'solid',
  'vue',
  'svelte',
  'preact',
  'elm',
];

const BUILD_DIR = path.join(__dirname, 'build');
// Port 3000 is often taken (and CI runners vary), so allow override.
// Playwright config passes E2E_PORT through to the webServer automatically.
const PORT = Number(process.env.E2E_PORT || 3000);

function localPackageDir(packageName) {
  return path.join(REPO_ROOT, 'packages', packageName);
}

function assertBuilt() {
  const required = [
    ...COMPONENTS.flatMap((c) => [
      `oc-template-${c}`,
      `oc-template-${c}-compiler`,
    ]),
    'oc-vite-compiler',
    'oc-vite',
    'oc-server',
  ];
  const missing = required.filter(
    (name) => !fs.existsSync(path.join(localPackageDir(name), 'dist'))
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing built packages (run "npm run build" from the repo root first):\n` +
        missing.map((m) => `  - packages/${m}/dist`).join('\n')
    );
  }
}

// Minimal semver check for the range shapes used in this repo
// (^x.y.z, ~x.y.z, exact versions, >=, * and || chains).
function satisfiesRange(version, range) {
  const parse = (v) => v.replace(/^[=v]/, '').split('-')[0].split('.').map(Number);
  const cmp = (a, b) => {
    for (let i = 0; i < 3; i++) {
      if (a[i] !== b[i]) {
        return a[i] < b[i] ? -1 : 1;
      }
    }
    return 0;
  };
  const satisfiesOne = (v, r) => {
    const ver = parse(v);
    if (r === '*' || r === 'x' || r === '') {
      return true;
    }
    let m;
    if ((m = r.match(/^\^(\d+)\.(\d+)\.(\d+)$/))) {
      const base = [Number(m[1]), Number(m[2]), Number(m[3])];
      const upper =
        base[0] > 0 ? [base[0] + 1, 0, 0] : base[1] > 0 ? [0, base[1] + 1, 0] : [0, 0, base[2] + 1];
      return cmp(ver, base) >= 0 && cmp(ver, upper) < 0;
    }
    if ((m = r.match(/^\^(\d+)$/))) {
      const base = [Number(m[1]), 0, 0];
      return cmp(ver, base) >= 0 && ver[0] === base[0];
    }
    if ((m = r.match(/^~(\d+)\.(\d+)\.(\d+)$/))) {
      const base = [Number(m[1]), Number(m[2]), Number(m[3])];
      return cmp(ver, base) >= 0 && ver[0] === base[0] && ver[1] === base[1];
    }
    if ((m = r.match(/^>=\s*(\d+)\.(\d+)\.(\d+)$/))) {
      return cmp(ver, [Number(m[1]), Number(m[2]), Number(m[3])]) >= 0;
    }
    if ((m = r.match(/^(\d+)\.(\d+)\.(\d+)$/))) {
      return cmp(ver, [Number(m[1]), Number(m[2]), Number(m[3])]) === 0;
    }
    // Unknown shape: fail open (keep the nested copy) rather than risk a
    // wrong deletion.
    return true;
  };
  return range
    .split('||')
    .map((part) => part.trim())
    .some((part) => satisfiesOne(version, part));
}

function readInstalledVersion(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version;
  } catch {
    return null;
  }
}

function copyDirIfExists(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { force: true, recursive: true });
  return true;
}

// Overlays the local build output (dist + scaffold) onto the published copy
// installed in the component, so e2e exercises local code.
function overlayLocalBuild(packageName, componentDir) {
  const srcRoot = localPackageDir(packageName);
  const destRoot = path.join(componentDir, 'node_modules', packageName);
  if (!fs.existsSync(path.join(destRoot, 'package.json'))) {
    throw new Error(
      `Expected installed dependency "${packageName}" in ${componentDir} (did "npm install" fail?)`
    );
  }
  for (const subdir of ['dist', 'scaffold']) {
    copyDirIfExists(path.join(srcRoot, subdir), path.join(destRoot, subdir));
  }
}

// Removes nested copies of dependencies that went stale: they were installed
// for the *published* metadata, but the overlaid local build declares
// different ranges. Deletions fall through to the component top level, which
// npm resolved from the template's (locally synced) ranges.
//
// Decisions use only package.json files on disk — never in-process module
// resolution, whose cache would otherwise be poisoned by the pre-prune state
// and keep failing on the deleted paths.
function pruneStaleNestedDeps(packageName, componentDir) {
  const destRoot = path.join(componentDir, 'node_modules', packageName);
  const nestedRoot = path.join(destRoot, 'node_modules');
  if (!fs.existsSync(nestedRoot)) {
    return;
  }
  const localPkg = JSON.parse(
    fs.readFileSync(path.join(localPackageDir(packageName), 'package.json'), 'utf8')
  );
  const ranges = {
    ...(localPkg.dependencies ?? {}),
    ...(localPkg.peerDependencies ?? {}),
    ...(localPkg.optionalDependencies ?? {}),
  };
  const nestedNames = [];
  for (const entry of fs.readdirSync(nestedRoot)) {
    if (entry === '.bin' || entry.startsWith('.')) {
      continue;
    }
    if (entry.startsWith('@')) {
      for (const child of fs.readdirSync(path.join(nestedRoot, entry))) {
        nestedNames.push(`${entry}/${child}`);
      }
    } else {
      nestedNames.push(entry);
    }
  }
  const pruned = [];
  for (const name of nestedNames) {
    const nestedVersion = readInstalledVersion(path.join(nestedRoot, name));
    const topVersion = readInstalledVersion(
      path.join(componentDir, 'node_modules', name)
    );
    if (topVersion === null) {
      continue; // Only copy: removing it would break resolution entirely.
    }
    const range = ranges[name];
    if (
      range !== undefined &&
      nestedVersion !== null &&
      satisfiesRange(nestedVersion, range)
    ) {
      continue; // Correct nesting (e.g. vite 6 under oc-vite-compiler).
    }
    if (
      range !== undefined &&
      nestedVersion !== null &&
      !satisfiesRange(topVersion, range)
    ) {
      console.warn(
        `Keeping nested ${name}@${nestedVersion} under ${packageName}: top-level ${topVersion} does not satisfy local range ${range}`
      );
      continue;
    }
    fs.rmSync(path.join(nestedRoot, name), { recursive: true, force: true });
    pruned.push(
      `${name}@${nestedVersion ?? 'unknown'} (top-level ${topVersion} used instead)`
    );
  }
  // Drop scope dirs left empty by pruning.
  for (const entry of fs.readdirSync(nestedRoot)) {
    if (
      entry.startsWith('@') &&
      fs.readdirSync(path.join(nestedRoot, entry)).length === 0
    ) {
      fs.rmdirSync(path.join(nestedRoot, entry));
    }
  }
  if (pruned.length > 0) {
    console.warn(
      `Pruned stale nested dependencies under ${packageName} in base-component-${componentDir.split('base-component-')[1]}: ${pruned.join(', ')}`
    );
  }
}

async function npmInstall(componentDir, args = []) {
  await execa('npm', ['install', '--no-audit', '--no-fund', ...args], {
    cwd: componentDir,
    stdio: 'inherit',
  });
}

// Requires the overlaid local packages in a FRESH child process. This catches
// broken trees (missing/unresolvable deps) with a clear error before the dev
// server starts, and sidesteps this process's module resolution cache, which
// may still point at dependency paths removed by pruning.
async function preflightComponent(component, componentDir) {
  const targets = [
    `oc-template-${component}-compiler`,
    'oc-server',
  ].map((p) => path.join(componentDir, 'node_modules', p));
  const script = targets
    .map((t) => `require(${JSON.stringify(t)});`)
    .join('');
  const result = await execa('node', ['-e', script], {
    cwd: componentDir,
    stdio: 'pipe',
    reject: false,
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `Pre-flight require failed for base-component-${component}:\n${result.stderr || result.stdout || result.shortMessage}`
    );
  }
}

async function initialize(component, { clean }) {
  const templateSrc = path.join(
    REPO_ROOT,
    'packages',
    'create-oc',
    'templates',
    component
  );
  if (!fs.existsSync(templateSrc)) {
    throw new Error(`Unknown template "${component}": ${templateSrc} missing`);
  }
  const componentDir = path.join(BUILD_DIR, `base-component-${component}`);

  // Start from a pristine copy of the template so changed files can't leak
  // between runs. node_modules is kept (unless clean) and reconciled by the
  // install below, which is fast when warm.
  if (clean) {
    fs.rmSync(componentDir, { recursive: true, force: true });
  }
  fs.mkdirSync(componentDir, { recursive: true });
  fs.cpSync(templateSrc, componentDir, { recursive: true, force: true });

  // npm v11+ blocks dependency install scripts by default. The elm package
  // (elm template) downloads its platform binary via an install script and
  // esbuild (via vite) may need its own, so allow them on the *copy* before
  // installing. Name-only entries cover any version since templates float.
  // (npm rejects --allow-scripts on project installs, hence package.json.)
  const componentPkgPath = path.join(componentDir, 'package.json');
  const componentPkg = JSON.parse(fs.readFileSync(componentPkgPath, 'utf8'));
  componentPkg.allowScripts = {
    ...(componentPkg.allowScripts ?? {}),
    elm: true,
    esbuild: true,
  };
  fs.writeFileSync(componentPkgPath, JSON.stringify(componentPkg, null, 2));

  console.log(`Installing packages for ${component}`);
  await npmInstall(componentDir);

  // Test the local workspace packages instead of the published copies.
  const localPackages = [
    `oc-template-${component}`,
    `oc-template-${component}-compiler`,
    'oc-vite-compiler',
    'oc-vite',
    'oc-server',
  ];
  for (const packageName of localPackages) {
    overlayLocalBuild(packageName, componentDir);
  }
  for (const packageName of localPackages) {
    pruneStaleNestedDeps(packageName, componentDir);
  }
  await preflightComponent(component, componentDir);
}

function resolveComponents() {
  const filter = process.env.COMPONENTS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!filter || filter.length === 0) {
    return COMPONENTS;
  }
  const unknown = filter.filter((c) => !COMPONENTS.includes(c));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown COMPONENTS filter [${unknown.join(', ')}]. Valid: ${COMPONENTS.join(', ')}`
    );
  }
  return filter;
}

async function start(clean = false) {
  const components = resolveComponents();
  assertBuilt();

  console.log(`Initializing components: ${components.join(', ')}`);
  for (const component of components) {
    await initialize(component, { clean });
  }

  // Compilers may shell out to binaries from component dependencies
  // (e.g. the elm compiler). npm scripts put node_modules/.bin on PATH
  // automatically; the dev server does not, so do it here.
  const delim = process.platform === 'win32' ? ';' : ':';
  const bins = components.map((c) =>
    path.join(BUILD_DIR, `base-component-${c}`, 'node_modules', '.bin')
  );
  process.env.PATH = `${bins.join(delim)}${delim}${process.env.PATH}`;

  console.log(`Starting dev server on port ${PORT}`);
  cli.dev(
    {
      components: components.map((c) => `base-component-${c}`),
      // Absolute so the server works regardless of the caller's cwd
      // (Playwright runs it from e2e/, humans may run it from anywhere).
      dirPath: BUILD_DIR,
      port: PORT,
      logger: {
        ok: console.log,
        err: console.error,
        log: console.info,
        warn: console.warn,
      },
    },
    (err, res) => {
      if (err) {
        console.error('Error:', err);
        process.exit(1);
      }
      if (!res) {
        console.error('Dev server did not return a handle');
        process.exit(1);
      }
      console.log('Dev server ready');
      process.on('SIGINT', () =>
        res.close(() => {
          console.log('Server closed');
          process.exit(0);
        })
      );
      process.on('SIGTERM', () =>
        res.close(() => {
          console.log('Server closed');
          process.exit(0);
        })
      );
    }
  );
}

const clean = process.argv[2] === 'clean';
start(clean).catch((err) => {
  console.error(err);
  process.exit(1);
});
