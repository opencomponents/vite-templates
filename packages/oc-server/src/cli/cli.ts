import path from 'node:path';
import { parseArgs } from 'node:util';
import { parsePkg } from './oc';
import { createServer } from './server';

const pkg = require(path.join(process.cwd(), 'package.json'));
const { templateType } = parsePkg(pkg);

interface Template {
  appBlock: (opts: { name: string; version: string; entry: string }) => string;
  plugin?: () => any;
}

export function cli() {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    'WARNING: The "oc-server dev" command is deprecated. Please use the Vite plugin instead by adding ocVitePlugin() to your vite.config.ts. See documentation for migration guide.'
  );

  const {
    positionals: [command],
    values: { help, port = '5000' },
  } = parseArgs({
    allowPositionals: true,
    options: {
      port: {
        type: 'string',
        default: '5000',
        short: 'p',
      },
      help: {
        type: 'boolean',
        default: false,
        short: 'h',
      },
    },
  });

  if (help || !command) {
    console.log(`
    Usage:
      $ oc-server <command> [options]

    Commands:
      dev         Start the development server

    Options:
      -h, --help  Display this message
    `);
    if (help && command === 'dev') {
      console.log(`
    Usage:
      $ oc-server <command> [options]

    Commands:
      dev         Start the development server

    Options:
      -h, --help  Display this message
      -p, --port  Port to use (default: 5000)
    `);
    }
    process.exit(0);
  }

  function tryRequire(name: string) {
    try {
      return { success: true, value: require(name) };
    } catch (e) {
      return { success: false, value: e as Error };
    }
  }

  const result = tryRequire(`${templateType}-compiler/dist/lib/hmr`);

  if (!result.success) {
    const code = String((result.value as { code: string }).code);

    if (code === 'ERR_REQUIRE_ESM') {
      console.error(
        'You are using an older version of node that does not support ESM on require. Please update to the latest 22.x or higher'
      );
    } else if (code === 'MODULE_NOT_FOUND') {
      const baseResult = tryRequire(`${templateType}-compiler`);
      if (baseResult.success) {
        console.error(
          `The template ${templateType} is not supported. Try updating to the last version`
        );
      } else {
        console.error(
          `Could not find the template compiler library: ${templateType}-compiler in your project`
        );
      }
    } else {
      console.error(result.value);
    }

    process.exit(1);
  }

  if (command === 'dev') {
    createServer({ template: result.value, port });
  }
}
