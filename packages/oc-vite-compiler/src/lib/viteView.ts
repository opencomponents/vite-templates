import { callbackify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import vite from 'oc-vite';
import EnvironmentPlugin from 'vite-plugin-environment';
import hashBuilder from 'oc-hash-builder';
import ocViewWrapper from 'oc-view-wrapper';
import cssModules from './cssModulesPlugin';
import type GenericCompiler from 'oc-generic-template-compiler';
import type { PluginOption, Rollup } from 'oc-vite';

type Compilers = Parameters<(typeof GenericCompiler)['createCompile']>[0];
type CompileClientOptions = Parameters<Compilers['compileView']>[0] & {
  publishFileName?: string;
  viewWrapper?: (opts: { viewPath: string }) => string;
  plugins?: PluginOption[];
  externals?: any;
  htmlTemplate: (opts: {
    templateId: string;
    css: string;
    externals: Array<{ name: string; global: string }>;
    bundle: string;
    hash: string;
  }) => void;
};

const clientName = 'clientBundle';
const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

const partition = <T>(array: T[], predicate: (x: T) => boolean): [T[], T[]] => {
  const matches = [];
  const rest = [];
  for (const element of array) {
    if (predicate(element)) {
      matches.push(element);
    } else {
      rest.push(element);
    }
  }
  return [matches, rest];
};

async function compileView(options: CompileClientOptions) {
  function processRelativePath(relativePath: string) {
    let pathStr = path.join(options.componentPath, relativePath);
    if (process.platform === 'win32') {
      return pathStr.split('\\').join('\\\\');
    }
    return pathStr;
  }

  const staticFiles = options.componentPackage.oc.files.static;
  let staticFolder = Array.isArray(staticFiles) ? staticFiles[0] : staticFiles;
  staticFolder = staticFolder?.replace(/^\//, '').replace(/\/$/, '');
  const viewFileName = options.componentPackage.oc.files.template.src;
  const componentPath = options.componentPath;
  const viewPath = processRelativePath(viewFileName);

  const publishPath = options.publishPath;
  const tempPath = path.join(publishPath, 'temp');
  const publishFileName = options.publishFileName || 'template.js';
  const componentPackage = options.componentPackage;
  const externals = options.externals || [];
  const production = !!options.production;
  const viewExtension = viewFileName.match(/\.\w{1,5}$/)?.[0] ?? '.js';

  const viewWrapperFn =
    options.viewWrapper ||
    (({ viewPath }) =>
      `export { default } from "${removeExtension(viewPath)}";`);
  const viewWrapperContent = viewWrapperFn({ viewPath });
  const viewWrapperName = `_viewWrapperEntry${viewExtension}`;
  const viewWrapperPath = path.join(tempPath, viewWrapperName);

  await fs.outputFile(viewWrapperPath, viewWrapperContent);

  const globals = externals.reduce((externals: any, dep: any) => {
    externals[dep.name] = dep.global;
    return externals;
  }, {} as Record<string, string>);

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
      EnvironmentPlugin(['NODE_ENV']),
      cssModules(),
      ...basePlugins,
    ] as any,
    logLevel: 'silent',
    build: {
      sourcemap: production ? false : 'inline',
      lib: { entry: viewWrapperPath, formats: ['iife'], name: clientName },
      write: false,
      minify: production,
      rollupOptions: {
        external: Object.keys(globals),
        output: {
          globals,
        },
      },
    },
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return {
            runtime: `__toOcStaticPathUrl(${JSON.stringify(filename)})`,
          };
        } else {
          return { relative: true };
        }
      },
    },
  });
  const out = (
    Array.isArray(result) ? result[0] : result
  ) as Rollup.RollupOutput;
  const bundle = (
    out.output.find((x) =>
      (x as Rollup.OutputChunk)?.facadeModuleId?.endsWith(viewWrapperName)
    )! as Rollup.OutputChunk
  ).code;
  const [cssAssets, otherAssets] = partition(
    out.output.filter((x) => x.type === 'asset'),
    (x) => x.fileName.endsWith('.css')
  );
  const cssStyles = cssAssets
    .map(
      (x) =>
        ((x as Rollup.OutputAsset).source as string).replace(/\r?\n/g, '') ?? ''
    )
    .join(' ')
    .replace(/'/g, '"');
  const bundleHash = hashBuilder.fromString(bundle);
  const wrappedBundle = `(function() {
    ${bundle}
    return ${clientName};
  })()`;

  const shortTemplateType = options.componentPackage.oc.files.template.type
    .replace('oc-template-', '')
    .replace(/-/, '');
  const templateId = `oc-${shortTemplateType}Root-${componentPackage.name}`;
  const templateString = options.htmlTemplate({
    templateId,
    css: cssStyles,
    externals,
    bundle: wrappedBundle,
    hash: bundleHash,
  });
  const wrappedTemplateString = `function(model) {
    var __toOcStaticPathUrl = function(args) {
      return model.component.props._staticPath + '${staticFolder}/' + args;
    } 
    var innerFn = ${templateString};
    return innerFn(model);
  }
  `;
  const hash = hashBuilder.fromString(wrappedTemplateString);
  const view = ocViewWrapper(hash, wrappedTemplateString);

  await fs.unlink(viewWrapperPath);
  await fs.mkdir(publishPath, { recursive: true });
  await fs.writeFile(path.join(publishPath, publishFileName), view);
  if (staticFolder) {
    for (const asset of otherAssets) {
      // asset.fileName could have paths like assets/file.js
      // so we need to create those extra directories
      await fs.ensureFile(path.join(publishPath, staticFolder, asset.fileName));
      await fs.writeFile(
        path.join(publishPath, staticFolder, asset.fileName),
        (asset as Rollup.OutputAsset).source,
        'utf-8'
      );
    }
  }

  return {
    template: {
      type: options.componentPackage.oc.files.template.type,
      hashKey: hash,
      src: publishFileName,
    },
    bundle: { hashKey: bundleHash },
  };
}

export default callbackify(compileView);
