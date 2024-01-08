import { callbackify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import vite from 'oc-vite';
import EnvironmentPlugin from 'vite-plugin-environment';
import hashBuilder from 'oc-hash-builder';
import ocViewWrapper from 'oc-view-wrapper';
import cssModules from './cssModulesPlugin';
import { providerFunctions } from './providerFunctions';
import htmlTemplate, { HtmlTemplate } from './htmlTemplate';
import type { CompilerOptions } from 'oc-generic-template-compiler';
import type { PluginOption, Rollup } from 'vite';

export interface ViteViewOptions {
  publishFileName?: string;
  viewWrapper?: (opts: {
    viewPath: string;
    providerFunctions: string;
  }) => string;
  plugins?: PluginOption[];
  externals?: any;
  htmlTemplate?: (opts: HtmlTemplate) => void;
}

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

const defaultViewWrapper = ({ viewPath }: { viewPath: string }) =>
  `import View from "${removeExtension(viewPath)}";

  export default function renderer(props, element) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    element.innerHTML = View(props);
  }
  `;

async function compileView(options: ViteViewOptions & CompilerOptions) {
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
  const viewExtension = viewFileName.match(/\.(jsx?|tsx?)$/)?.[0] ?? '.js';

  const viewWrapperFn = options.viewWrapper || defaultViewWrapper;
  const viewWrapperContent = viewWrapperFn({ viewPath, providerFunctions });
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
      {
        name: 'OcServerRuntime',
        enforce: 'pre',
        transform(code: string, id: string) {
          if (id.includes('node_modules/oc-server/dist/serverClient.js')) {
            code = code.replace(
              /("|')COMPONENT_NAME("|')/,
              `"${componentPackage.name}"`
            );
            code = code.replace(
              /("|')COMPONENT_VERSION("|')/,
              `"${componentPackage.version}"`
            );
            return {
              code,
              map: null,
            };
          }
          if (id.includes('node_modules/oc-server/dist/Server.js')) {
            code = code.replace(/("|')__INITIAL__DATA__("|')/, '{}');
            return {
              code,
              map: null,
            };
          }
        },
      },
      ...plugins,
      EnvironmentPlugin(['NODE_ENV']),
      cssModules(),
      ...basePlugins,
    ] as any,
    logLevel: 'silent',
    build: {
      // Source map doesn't work properly because the bundle gets wrapped into more code and the
      // lines don't match anymore (would be nice to fix this somehow)
      sourcemap: false,
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
        ((x as Rollup.OutputAsset).source as string).replace(/\r?\n|\t/g, '') ??
        ''
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
  const hash = hashBuilder.fromString(wrappedBundle);
  const htmlTemplateWrapper = options.htmlTemplate || htmlTemplate;
  const templateString = htmlTemplateWrapper({
    templateId,
    templateName: shortTemplateType,
    css: cssStyles,
    externals,
    bundle: wrappedBundle,
    componentHash: bundleHash,
    hash,
  });
  const wrappedTemplateString = `function(model) {
    var __toOcStaticPathUrl = function(args) {
      return model.component.props._staticPath + '${staticFolder}/' + args;
    } 
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = model.component.props;
    var __$$oc_initialData__ = rest;
    var __$$oc_Settings__ = {id: model.id, staticPath: _staticPath, baseUrl: _baseUrl, name: _componentName, version: _componentVersion};
    var innerFn = ${templateString};
    return innerFn(model);
  }
  `;
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
