import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import esbuild from 'esbuild';
import ocClientBrowser from 'oc-client-browser';
import cssModulesPlugin from 'oc-vite-compiler/dist/lib/cssModulesPlugin';
import { getContext, parsePkg } from './oc';
import getMockedPlugins from './get-mocked-plugins';

const promisify =
  (fn: any) =>
  (...args: any) =>
    new Promise((resolve, reject) =>
      fn(...args, (err: any, data: any) => (err ? reject(err) : resolve(data)))
    );

const pk = require(path.join(process.cwd(), 'package.json'));
const { name, version, appEntry, serverEntry, defaultParams } = parsePkg(pk);

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
    ${appBlock({ name, version, entry: appEntry })}
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
        name,
        version,
        entry: appEntry,
      })}</body>`
    );
  } catch (error) {
    template = getBaseTemplate(appBlock);
  }

  return template;
}

export async function createServer({
  template,
  port,
}: {
  template: Template;
  port: string;
}) {
  const { dev: clientJs } = ocClientBrowser.compileSync();
  const app = express();
  const dataProvider = getDataProvider();
  const plugins = getMockedPlugins(path.join(process.cwd(), '..'));
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
      const { context, responseHeaders } = getContext(
        plugins,
        req,
        parameters,
        action
      );
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
      const { context, responseHeaders } = getContext(plugins, req, params);
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

interface Template {
  appBlock: (opts: { name: string; version: string; entry: string }) => string;
  plugin?: () => any;
}
