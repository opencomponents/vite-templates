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
import type { CompilerOptions } from './createCompile';
import type { PluginOption, Rollup } from 'vite';

interface External {
  name: string;
  paths?: string[];
  global?: string;
}

interface GlobalExternal extends External {
  global: string;
}
interface EsmExternal extends External {
  global: undefined;
}

function isGlobalExternal(data: External): data is GlobalExternal {
  return data.global !== undefined;
}
function isEsmExternal(data: External): data is EsmExternal {
  return data.global === undefined;
}

export interface ViteViewOptions {
  publishFileName?: string;
  viewWrapper?: (opts: {
    viewPath: string;
    providerFunctions: string;
  }) => string;
  plugins?: PluginOption[];
  externals?: Array<{ name: string; global?: string; paths?: string[] }>;
  htmlTemplate?: (opts: HtmlTemplate) => void;
}

const clientName = 'clientBundle';
const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

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
  const globalExternals = (options.externals || []).filter(isGlobalExternal);
  const esmExternals = (options.externals || []).filter(isEsmExternal);
  const production = !!options.production;
  const viewExtension = viewFileName.match(/\.(jsx?|tsx?)$/)?.[0] ?? '.js';

  const viewWrapperFn = options.viewWrapper || defaultViewWrapper;
  const viewWrapperContent = viewWrapperFn({ viewPath, providerFunctions });
  const viewWrapperName = `_viewWrapperEntry${viewExtension}`;
  const viewWrapperPath = path.join(tempPath, viewWrapperName);

  await fs.outputFile(viewWrapperPath, viewWrapperContent);

  const globals = globalExternals.reduce((externals, dep) => {
    externals[dep.name] = dep.global;
    for (const path of dep.paths ?? []) {
      const normalizedPath = path.replace(/^\//, '');
      externals[`${dep.name}/${normalizedPath}`] = dep.global;
    }
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

  const otherAssets: vite.Rollup.OutputAsset[] = [];
  let hash = '';
  const wrapperPlugin: vite.PluginOption = {
    name: 'WrapEntry',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      const mainBundleName = `${clientName}.iife.js`;
      const main = bundle[mainBundleName];
      if (main.type !== 'chunk') {
        throw new Error('Error compiling the bundle.');
      }

      let cssStyles = '';
      for (const [key, out] of Object.entries(bundle)) {
        if (key === mainBundleName) continue;
        if (out.type === 'asset') {
          if (out.fileName.endsWith('.css')) {
            const source =
              typeof out.source === 'string'
                ? out.source
                : new TextDecoder('utf-8').decode(out.source);
            cssStyles += `${source
              .replace(/\r?\n|\t/g, '')
              .replace(/'/g, '"')}`;
          } else {
            otherAssets.push(out);
          }
        }
      }

      const iife = `
           (function() {
            ${main.code}
            return ${clientName};
           })()`;

      const shortTemplateType = options.componentPackage.oc.files.template.type
        .replace('oc-template-', '')
        .replace(/-/, '');
      const templateId = `oc-${shortTemplateType}Root-${componentPackage.name}`;
      hash = hashBuilder.fromString(iife);
      const htmlTemplateWrapper = options.htmlTemplate || htmlTemplate;
      const templateString = htmlTemplateWrapper({
        templateId,
        templateName: shortTemplateType,
        css: cssStyles,
        externals: globalExternals,
        bundle: iife,
        hash,
      });
      const wrappedTemplateString = `function(model) {
           var __toOcStaticPathUrl = function(args) {
             return model.component.props._staticPath + '${staticFolder}/' + args;
           } 
           const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = model.component.props;
           var __$$oc_initialData__ = rest;
           var element = model.element || typeof document !== 'undefined' ? document.querySelector(window.oc.conf.tag || 'oc-component' + '[data-id="'+ model.id +'"]') : null;
           var __$$oc_Settings__ = {id: model.id, element: element, staticPath: _staticPath, baseUrl: _baseUrl, name: _componentName, version: _componentVersion};
           var innerFn = ${templateString};
           return innerFn(model);
         }
         `;
      const view = ocViewWrapper(hash, wrappedTemplateString);

      main.code = view;
    },
  };

  const result = await vite.build({
    appType: 'custom',
    root: componentPath,
    mode: production ? 'production' : 'development',
    plugins: [
      wrapperPlugin,
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
      lib: {
        entry: viewWrapperPath,
        formats: ['iife'],
        name: clientName,
        fileName: clientName,
      },
      write: false,
      minify: production,
      rollupOptions: {
        external: [...Object.keys(globals), ...esmExternals.map((x) => x.name)],
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

  await fs.unlink(viewWrapperPath);
  await fs.mkdir(publishPath, { recursive: true });
  await fs.writeFile(path.join(publishPath, publishFileName), bundle);
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
    bundle: { hashKey: hash },
  };
}

export default callbackify(compileView);
