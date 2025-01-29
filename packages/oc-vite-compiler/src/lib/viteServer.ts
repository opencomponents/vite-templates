import path from 'path';
import { callbackify } from 'util';
import vite, { Rollup } from 'oc-vite';
import fs from 'fs-extra';
import coreModules from 'builtin-modules';
import hashBuilder from 'oc-hash-builder';
import serverWrapper, { ServerWrapper } from './serverWrapper';
import type { CompilerServerOptions } from 'oc-generic-template-compiler';
import type { PluginOption } from 'oc-vite';
import { init, parse } from 'es-module-lexer';

interface ViteServerOptions {
  publishFileName?: string;
  serverWrapper?: ServerWrapper;
  plugins?: PluginOption[];
}

const nodeModuleMatcher = /^[a-z@][a-z\-/0-9.]+$/i;
const moduleWithPathMatcher = /^(?!@).*\//g;

async function compileServer(
  options: ViteServerOptions & CompilerServerOptions
) {
  const componentPath = options.componentPath;
  const serverFileName = options.componentPackage.oc.files.data;
  let serverPath = path.join(options.componentPath, serverFileName);
  if (process.platform === 'win32') {
    serverPath = serverPath.split('\\').join('\\\\');
  }
  const publishFileName = options.publishFileName || 'server.js';
  const publishPath = options.publishPath;
  const dependencies = options.componentPackage.dependencies || {};
  const componentName = options.componentPackage.name;
  const componentVersion = options.componentPackage.version;
  const production = !!options.production;

  const wrapperFn = options.serverWrapper || serverWrapper;
  await init;
  const [, entryExports] = await parse(await fs.readFile(serverPath, 'utf-8'));
  const higherOrderServerContent = wrapperFn({
    exports: entryExports.map((x) => x.n),
    bundleHashKey: options.compiledViewInfo.bundle.hashKey,
    serverPath,
    componentName,
    componentVersion,
  });
  const tempFolder = path.join(publishPath, 'temp');
  const higherOrderServerPath = path.join(
    tempFolder,
    '__oc_higherOrderServer.ts'
  );
  const externals = [...Object.keys(dependencies), ...coreModules];

  try {
    await fs.outputFile(higherOrderServerPath, higherOrderServerContent);

    const plugins = options?.plugins ?? [];
    const pluginsNames = plugins.map((x: any) => x?.name).filter(Boolean);
    const baseConfig = await vite
      // @ts-ignore
      .loadConfigFromFile(process.cwd())
      .catch(() => null);
    const basePlugins =
      baseConfig?.config?.plugins?.filter(
        (p: any) => !pluginsNames.includes(p?.name)
      ) ?? [];

    const result = await vite.build({
      appType: 'custom',
      root: componentPath,
      mode: production ? 'production' : 'development',
      plugins: [
        ...plugins,
        ...basePlugins,
        {
          name: 'save-parameters',
          transform(code, id) {
            if (id === higherOrderServerPath && !production) {
              code = `
            ${code}
            let parameters = null;
            try {
              parameters = server._parameters;
            } catch (e) {}

            if (parameters && Object.keys(parameters).length > 0) {
              try {
                const fs = require("fs");
                const path = require("path");
                const finder = require('find-package-json');

                const { value: pkg, filename: pkgPath } = finder("${publishPath}").next();
                const prevParameters = pkg.oc.parameters || {};
          
                if (JSON.stringify(prevParameters) !== JSON.stringify(parameters)) {
                  pkg.oc.parameters = Object.assign(prevParameters, parameters);
                  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
                }
              } catch (e){
                console.log("There was an error trying to update the package.json file with the parameters");
              }
            }
            `;
            }
            return {
              code,
              map: null,
            };
          },
        },
      ],
      logLevel: options.verbose ? 'info' : 'silent',
      build: {
        lib: { entry: higherOrderServerPath, formats: ['cjs'] },
        write: false,
        minify: production,
        rollupOptions: {
          external: (id) => {
            if (id === 'oc-server') return false;
            if (nodeModuleMatcher.test(id)) {
              if (moduleWithPathMatcher.test(id)) {
                id = id.split('/')[0];
              }

              if (!externals.includes(id)) {
                throw new Error(
                  `Missing dependencies from package.json => ${id}`
                );
              }
              return true;
            }
            return false;
          },
        },
      },
    });
    const out = Array.isArray(result) ? result[0] : result;
    const bundle = (out as Rollup.RollupOutput).output[0].code;

    await fs.ensureDir(publishPath);
    await fs.writeFile(path.join(publishPath, publishFileName), bundle);
    try {
      require(path.join(publishPath, publishFileName));
    } catch {}

    return {
      type: 'node.js',
      hashKey: hashBuilder.fromString(bundle),
      src: publishFileName,
    };
  } finally {
    await fs.remove(tempFolder);
  }
}

export default callbackify(compileServer);
