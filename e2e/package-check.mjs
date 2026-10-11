import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'oc';

const { cli } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.join(__dirname, 'build');

// Markers proving the component CSS made it into the production bundle.
// Every template paints the container #0f172a and the button #4f46e5.
const CSS_MARKERS = ['0f172a', '4f46e5'];

const quietLogger = {
  ok() {},
  err() {},
  log() {},
  warn() {},
};

function discoverComponents() {
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error(
      `No e2e/build directory found. Run the dev registry or "npm test" first so components are staged.`
    );
  }
  const components = fs
    .readdirSync(BUILD_DIR)
    .filter((entry) => entry.startsWith('base-component-'))
    // Dots are invalid in component names, so dotted directories are always
    // leftovers from older runs (see registry.js safeName normalization).
    .filter((entry) => !entry.slice('base-component-'.length).includes('.'))
    .sort();
  if (components.length === 0) {
    throw new Error(`No base-component-* directories found in ${BUILD_DIR}`);
  }
  return components;
}

async function checkComponent(component) {
  const componentPath = path.join(BUILD_DIR, component);
  await cli.package({ componentPath, logger: quietLogger });

  for (const file of ['template.js', 'server.js']) {
    if (!fs.existsSync(path.join(componentPath, '_package', file))) {
      throw new Error(`${component}: production package is missing _package/${file}`);
    }
  }

  const bundle = fs.readFileSync(
    path.join(componentPath, '_package', 'template.js'),
    'utf8'
  );
  const missing = CSS_MARKERS.filter(
    (marker) => !bundle.toLowerCase().includes(marker)
  );
  if (missing.length > 0) {
    throw new Error(
      `${component}: production template.js is missing CSS markers (${missing.join(', ')}) — styles were not bundled`
    );
  }
  console.log(`${component}: packaged OK (template.js + server.js, CSS bundled)`);
}

const components = discoverComponents();
console.log(`Verifying production packaging: ${components.join(', ')}`);
for (const component of components) {
  await checkComponent(component);
}
console.log('All components packaged successfully');
