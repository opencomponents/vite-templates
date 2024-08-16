#!/usr/bin/env node
process.env.VITE_CJS_IGNORE_WARNING = 'true';

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import express, { Request } from 'express';
import { createServer as createViteServer } from 'vite';
import esbuild from 'esbuild';
import ocClientBrowser from 'oc-client-browser';
import cssModulesPlugin from 'oc-vite-compiler/dist/lib/cssModulesPlugin';
import getMockedPlugins from 'oc/dist/cli/domain/get-mocked-plugins.js';
import { parseArgs } from 'node:util';

const promisify =
  (fn: any) =>
  (...args: any) =>
    new Promise((resolve, reject) =>
      fn(...args, (err: any, data: any) => (err ? reject(err) : resolve(data)))
    );

const plugins = getMockedPlugins(
  { err: () => {}, log: () => {}, ok: () => {}, warn: () => {} },
  path.join(process.cwd(), '..')
);
const pkg: {
  name: string;
  version: string;
  oc?: {
    parameters?: Record<
      string,
      {
        mandatory: boolean;
        example: string | number | boolean;
      }
    >;
    files: {
      data?: string;
      template?: {
        type?: string;
        src?: string;
      };
    };
  };
} = require(path.join(process.cwd(), 'package.json'));

const serverEntry = pkg.oc?.files?.data;
let appEntry = pkg.oc?.files?.template?.src || '';
if (!appEntry) {
  console.log(
    'Missing an entry on your package.json under oc.files.template.src'
  );
  process.exit(1);
}
if (!appEntry.startsWith('/')) {
  appEntry = `/${appEntry}`;
}

const defaultParams = (() => {
  let params = {};
  if (pkg.oc?.parameters) {
    params = Object.fromEntries(
      Object.entries(pkg.oc.parameters || {})
        .filter(([, param]) => {
          return !!param.mandatory && 'example' in param;
        })
        .map(([paramName, param]) => [paramName, param.example])
    );
  }

  return params;
})();

function getDataProvider() {
  if (!serverEntry) {
    return async (context: { params: {} }) => ({ ...(context.params ?? {}) });
  }

  const result = esbuild.buildSync({
    entryPoints: [serverEntry],
    bundle: true,
    format: 'cjs',
    write: false,
  });
  const code = result.outputFiles[0].text;
  const backend = vm.runInNewContext(code, {
    ...globalThis,
    exports: {},
    module: { exports: {} },
  });

  const dataProvider = backend.data || backend.server.getData();

  return promisify(dataProvider);
}

function getContext(req: Request, params: any, action?: any) {
  const responseHeaders: Record<string, string> = {};
  const context = {
    action,
    acceptLanguage: req.headers['accept-language'],
    easeUrl: '/',
    env: { name: 'local' },
    params,
    plugins: Object.fromEntries(
      plugins.map((plugin) => [plugin.name, plugin.register.execute])
    ),
    renderComponent: () => {
      throw new Error(
        'renderComponent is not implemented in the server context'
      );
    },
    renderComponents: () => {
      throw new Error(
        'renderComponents is not implemented in the server context'
      );
    },
    requestHeaders: req.headers,
    requestIp: req.ip,
    setEmptyResponse: null,
    staticPath: '/',
    setHeader: (header: string, value: string) => {
      if (!(typeof header === 'string' && typeof value === 'string')) {
        throw new Error('context.setHeader parameters must be strings');
      }

      if (header && value) {
        responseHeaders[header.toLowerCase()] = value;
      }
    },
    templates: 'repository.getTemplatesInfo()',
  };

  return { context, responseHeaders };
}

function getBaseTemplate(appBlock: Template['appBlock']) {
  const baseTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="robots" content="index, follow" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
    };
    </style>
  </head>
  <body>
    <script src="/oc-client/client.js"></script>
    ${appBlock({ name: pkg.name, version: pkg.version, entry: appEntry })}
  </body>
</html>
  `;
  return baseTemplate;
}

async function getHtmlTemplate(
  appBlock: Template['appBlock'],
  filePath = 'index.html'
) {
  let template;
  try {
    template = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    if (!template.includes('</body>')) {
      throw new Error(
        'If you use a custom html entry it has to have a closing body tag'
      );
    }
    template = template.replace(
      '</body>',
      `<script>
        if (!window.oc?.status) {
          const script = document.createElement('script');
          script.src = '/oc-client/client.js';
          document.body.appendChild(script);
        }
      </script>
      ${appBlock({
        name: pkg.name,
        version: pkg.version,
        entry: appEntry,
      })}</body>`
    );
  } catch (error) {
    template = getBaseTemplate(appBlock);
  }

  return template;
}

async function createServer({
  template,
  port,
}: {
  template: Template;
  port: string;
}) {
  const { dev: clientJs } = ocClientBrowser.compileSync();
  const app = express();
  const dataProvider = getDataProvider();
  for (const plugin of plugins) {
    plugin.register.register(null, null, () => {});
  }

  app.use(express.json());

  const vite = await createViteServer({
    server: { middlewareMode: true },
    plugins: [cssModulesPlugin(), template.plugin?.()].filter(Boolean),
    mode: 'development',
    optimizeDeps: {
      exclude: ['fsevents'],
    },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.get('/oc-client/client.js', (req, res) => {
    res.status(200).set({ 'Content-Type': 'text/javascript' }).send(clientJs);
  });

  app.post('/', async (req, res, next) => {
    try {
      const { action, parameters } = req.body.components[0];
      const { context, responseHeaders } = getContext(req, parameters, action);
      const props = await dataProvider(context);

      const response = [
        {
          status: 200,
          response: {
            data: {
              component: {
                props,
              },
            },
          },
        },
      ];

      if (Object.keys(responseHeaders).length) {
        res.set(responseHeaders);
      }

      res
        .status(200)
        .set({ 'Content-Type': 'application/json' })
        .send(response);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const params = defaultParams;
      const { context, responseHeaders } = getContext(req, params);
      let htmlTemplate = await getHtmlTemplate(template.appBlock);
      const data = await dataProvider(context);
      htmlTemplate = htmlTemplate.replace(
        '__INITIAL_DATA__',
        JSON.stringify(data)
      );
      htmlTemplate = await vite.transformIndexHtml(url, htmlTemplate);

      if (Object.keys(responseHeaders).length) {
        res.set(responseHeaders);
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlTemplate);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.listen(port);
  console.log(`Listening on: http://localhost:${port}`);
}

const major = Number(process.versions.node.split('.')[0]) || 0;
if (major < 22) {
  console.error('This script requires Node.js v22 or higher');
  process.exit(1);
}

interface Template {
  appBlock: (opts: { name: string; version: string; entry: string }) => string;
  plugin?: () => any;
}

function cli(template: Template) {
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

  if (command === 'dev') {
    createServer({ template, port });
  }
}

let template: Template;
try {
  template = require(`${pkg.oc?.files?.template?.type}-compiler/dist/lib/hmr`);
} catch (e) {
  console.error(
    `The template ${pkg.oc?.files?.template?.type} is not supported. Try updating to the last version`
  );
  process.exit(1);
}

cli(template);
