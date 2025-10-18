import type { Plugin, ViteDevServer } from 'vite';

interface OcVitePluginOptions {
  port?: number;
}

export function ocVitePlugin(options: OcVitePluginOptions = {}): Plugin {
  const moduleRequire = typeof require !== 'undefined' ? require : null;
  
  if (!moduleRequire) {
    throw new Error('oc-vite-plugin requires a CommonJS environment with require() available');
  }

  return {
    name: 'oc-vite-plugin',
    async configureServer(server: ViteDevServer) {
      const fs = moduleRequire('node:fs');
      const path = moduleRequire('node:path');
      const vm = moduleRequire('node:vm');
      const esbuild = moduleRequire('esbuild');
      const { loadConfigFromFile } = moduleRequire('vite');
      const ocClientBrowser = moduleRequire('oc-client-browser');
      const { getContext, getDefaultParams, parsePkg } = moduleRequire('./cli/oc');
      const getMockedPlugins = moduleRequire('./cli/get-mocked-plugins').default;

      const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
      const parsedPkg = parsePkg(pkg);
      const templateType = parsedPkg.templateType;

      const { createRequire } = moduleRequire('module');
      const projectRequire = createRequire(path.join(process.cwd(), 'package.json'));

      const tryRequire = (name: string) => {
        try {
          return { success: true, value: projectRequire(name) };
        } catch (e) {
          return { success: false, value: e as Error };
        }
      };

      const result = tryRequire(`${templateType}-compiler/dist/lib/hmr`);

      if (!result.success) {
        const code = String((result.value as { code: string }).code);

        if (code === 'ERR_REQUIRE_ESM') {
          throw new Error(
            'You are using an older version of node that does not support ESM on require. Please update to the latest 22.x or higher'
          );
        } else if (code === 'MODULE_NOT_FOUND') {
          const baseResult = tryRequire(`${templateType}-compiler`);
          if (baseResult.success) {
            throw new Error(
              `The template ${templateType} is not supported. Try updating to the last version`
            );
          } else {
            throw new Error(
              `Could not find the template compiler library: ${templateType}-compiler in your project`
            );
          }
        } else {
          throw result.value;
        }
      }

      const template = result.value;

        const promisify = (fn: any) => (...args: any) =>
          new Promise((resolve, reject) =>
            fn(...args, (err: any, data: any) => (err ? reject(err) : resolve(data)))
          );

        const getDataProvider = (serverEntry?: string) => {
          if (!serverEntry) {
            return {
              dataProvider: async (context: { params: {} }) => ({
                ...(context.params ?? {}),
              }),
            };
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
            console,
            module: { exports: {} },
          });

          const dataProvider = backend.data || backend.server.getData();

          return {
            dataProvider: promisify(dataProvider),
            parametersSchema: backend.server?._parameters,
          };
        };

        const getBaseTemplate = (
          appBlock: any,
          name: string,
          version: string,
          appEntry: string,
          imports: Record<string, string> = {}
        ) => {
          return `
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
    }
    </style>
    ${imports ? `<script type="importmap">{"imports": ${JSON.stringify(imports)}}</script>` : ''}
  </head>
  <body>
    <script src="/oc-client/client.js"></script>
    ${appBlock({ name, version, entry: appEntry })}
  </body>
</html>
  `;
        };

        const getHtmlTemplate = async (
          appBlock: any,
          name: string,
          version: string,
          appEntry: string,
          imports: Record<string, string> = {},
          filePath = 'index.html'
        ) => {
          let htmlTemplate;
          try {
            htmlTemplate = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
            if (!htmlTemplate.includes('</body>')) {
              throw new Error('If you use a custom html entry it has to have a closing body tag');
            }
            htmlTemplate = htmlTemplate.replace(
              '</body>',
              `<script>
        if (!window.oc?.status) {
          const script = document.createElement('script');
          script.src = '/oc-client/client.js';
          document.body.appendChild(script);
        }
      </script>
      ${appBlock({ name, version, entry: appEntry })}</body>`
            );
          } catch (error) {
            htmlTemplate = getBaseTemplate(appBlock, name, version, appEntry, imports);
          }

          return htmlTemplate;
        };

      const name = parsedPkg.name;
      const version = parsedPkg.version;
      const appEntry = parsedPkg.appEntry;
      const serverEntry = parsedPkg.serverEntry;

      const dpResult = getDataProvider(serverEntry);
      const dataProvider = dpResult.dataProvider;
      const parametersSchema = dpResult.parametersSchema;

      const plugins = getMockedPlugins(path.join(process.cwd(), '..'));
      for (const plugin of plugins) {
        plugin.register.register(null, null, () => {});
      }

      const defaultParams = getDefaultParams(pkg.oc?.parameters ?? parametersSchema);

      const baseConfig = await loadConfigFromFile(
        {
          command: 'build',
          mode: 'development',
        },
        undefined,
        process.cwd()
      ).catch(() => null);
      const baseConfigImports = baseConfig?.config?.resolve?.alias;

      const { dev: clientJs } = ocClientBrowser.compileSync();

      server.middlewares.use('/oc-client/client.js', (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/javascript');
        res.end(clientJs);
      });

      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              const { action, parameters } = JSON.parse(body).components[0];
              const { context, responseHeaders } = getContext(
                plugins,
                req as any,
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

              for (const [key, value] of Object.entries(responseHeaders)) {
                res.setHeader(key, value as string);
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(response));
            });
          } catch (e) {
            server.ssrFixStacktrace(e as Error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        } else {
          next();
        }
      });

      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'GET' && req.url === '/') {
          try {
            const params = defaultParams;
            const { context, responseHeaders } = getContext(
              plugins,
              req as any,
              params
            );
            let htmlTemplate = await getHtmlTemplate(
              template.appBlock,
              name,
              version,
              appEntry,
              typeof baseConfigImports === 'object' && !!baseConfigImports
                ? (baseConfigImports as Record<string, string>)
                : {}
            );
            const data = await dataProvider(context);
            htmlTemplate = htmlTemplate.replace(
              '__INITIAL_DATA__',
              JSON.stringify(data)
            );

            const transformedHtml = await server.transformIndexHtml(
              req.url || '/',
              htmlTemplate
            );

            for (const [key, value] of Object.entries(responseHeaders)) {
              res.setHeader(key, value as string);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(transformedHtml);
          } catch (e) {
            server.ssrFixStacktrace(e as Error);
            next(e);
          }
        } else {
          next();
        }
      });
    },
  };
}
