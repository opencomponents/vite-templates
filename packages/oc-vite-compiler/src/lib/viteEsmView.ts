import { callbackify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import vite from 'oc-vite';
import { providerFunctions } from './providerFunctions';
import { HtmlTemplate } from './htmlTemplate';
import type { CompilerOptions } from './createCompile';
import type { PluginOption, Rollup } from 'vite';

export interface ViteViewOptions {
  publishFileName?: string;
  viewWrapper?: (opts: {
    viewPath: string;
    providerFunctions: string;
  }) => string;
  plugins?: PluginOption[];
  externals?: Array<{ name: string; paths?: string[] }>;
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
  const production = !!options.production;
  const viewExtension = viewFileName.match(/\.(jsx?|tsx?)$/)?.[0] ?? '.js';

  const viewWrapperFn = options.viewWrapper || defaultViewWrapper;
  const viewWrapperContent = viewWrapperFn({ viewPath, providerFunctions });
  const viewWrapperName = `_viewWrapperEntry${viewExtension}`;
  const viewWrapperPath = path.join(tempPath, viewWrapperName);

  await fs.outputFile(viewWrapperPath, viewWrapperContent);

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
        },
      },
      ...plugins,
      ...basePlugins,
    ] as any,
    logLevel: 'silent',
    build: {
      sourcemap: true,
      lib: {
        entry: viewWrapperPath,
        formats: ['es'],
        name: clientName,
        fileName: clientName,
      },
      write: true,
      minify: production,
      rollupOptions: {
        external: options.externals?.map((x) => x.name) ?? [],
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
