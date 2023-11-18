import fs from 'fs';
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

const exceptions = ['oc-vite'];

const pkgList = fs
  .readdirSync('./packages')
  .filter((x) => !exceptions.includes(x));

let failures = false;
for (const pkg of pkgList) {
  const pkgChecks = checkPkg(pkg);

  if (pkgChecks.length) {
    failures = true;
    console.log(`Misconfig on package ${pkg}`);
    console.log();
    for (const check of pkgChecks) console.log(check);
  }

  const tsChecks = checkTs(pkg);

  if (tsChecks.length) {
    failures = true;
    console.log(`Misconfig on tsconfig ${pkg}`);
    console.log();
    for (const check of tsChecks) console.log(check);
  }
}
process.exit(failures ? 1 : 0);

function checkPkg(pkg) {
  const pkgJson = readJson(`./packages/${pkg}/package.json`);

  const expectations = {
    'scripts.build': 'tsc',
    'scripts.prepare': 'npm run build',
    files: ['dist', 'README.md', 'LICENSE'].concat(
      isPkgCompiler(pkg) ? 'scaffold' : []
    ),
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    license: 'MIT',
  };
  let checks = [];
  for (const [prop, expected] of Object.entries(expectations)) {
    checks.push(checkPath(pkgJson, prop, expected));
  }
  return checks.filter(Boolean);
}

function checkTs(pkg) {
  const tsConfig = readJson(`./packages/${pkg}/tsconfig.json`);

  const expectations = {
    'compilerOptions.target': 'ES2022',
    'compilerOptions.module': 'commonjs',
    'compilerOptions.declaration': true,
    'compilerOptions.outDir': './dist',
    'compilerOptions.strict': true,
    'compilerOptions.esModuleInterop': true,
    include: ['./src'].concat(isPkgTemplate(pkg) ? './globals.d.ts' : []),
  };
  let checks = [];
  for (const [prop, expected] of Object.entries(expectations)) {
    checks.push(checkPath(tsConfig, prop, expected));
  }
  return checks.filter(Boolean);
}

function checkPath(obj, prop, expected) {
  const path = prop.split('.').filter(Boolean);
  let value = undefined;
  for (const part of path) {
    value = value?.[part] || obj?.[part];
  }
  const isObjComparison = !!expected && typeof expected === 'object';
  if (isObjComparison) {
    value = JSON.stringify(value);
    expected = JSON.stringify(expected);
  }

  const equal = value === expected;

  if (equal) return undefined;
  return `On path (${prop}) expected\n  [${expected}]\nbut got\n  [${value}]\n`;
}

function isPkgCompiler(pkg) {
  return pkg.endsWith('-compiler') && pkg !== 'oc-vite-compiler';
}

function isPkgTemplate(pkg) {
  return pkg.startsWith('oc-template-') && !pkg.endsWith('-compiler');
}
