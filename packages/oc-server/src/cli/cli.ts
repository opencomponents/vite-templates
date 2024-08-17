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

  let template: Template;
  try {
    template = require(`${templateType}-compiler/dist/lib/hmr`);
  } catch (e) {
    console.error(
      `The template ${templateType} is not supported. Try updating to the last version`
    );
    process.exit(1);
  }

  if (command === 'dev') {
    createServer({ template, port });
  }
}
