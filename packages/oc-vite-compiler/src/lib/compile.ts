import { createCompile as genericCompile, GetInfo } from './createCompile';
import compileStatics from 'oc-statics-compiler';
import viteServer from './viteServer';
import viteView, { ViteViewOptions } from './viteView';
import viteEsmView from './viteEsmView';
import type { PluginOption } from 'vite';

type External = {
  name: string;
  paths?: string[];
  global?: string;
  url: string;
};

function checkExternal(data: unknown): data is External {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { name: unknown }).name === 'string' &&
    (!(data as { global: unknown }).global ||
      typeof (data as { global: unknown }).global === 'string') &&
    typeof (data as { url: unknown }).url === 'string'
  );
}
function checkExternals(data: unknown): data is External[] {
  return Array.isArray(data) && data.every((item) => checkExternal(item));
}

export default function createCompile(params: {
  plugins?: PluginOption[];
  viewWrapper?: ViteViewOptions['viewWrapper'];
  htmlTemplate?: ViteViewOptions['htmlTemplate'];
  getInfo: GetInfo;
}) {
  // Minimum OC version required to support logs from browser
  let minOcVersion = '0.50.18';
  const getInfo = () => ({ ...params.getInfo(), minOcVersion });

  return genericCompile({
    compileView(options, cb) {
      let externals: External[];
      if (options.componentPackage.oc.files.template.externals) {
        const valid = checkExternals(
          options.componentPackage.oc.files.template.externals
        );
        if (valid) {
          externals = options.componentPackage.oc.files.template.externals;
        } else {
          throw new Error(
            `Invalid externals on ${options.componentPackage.name}. Expected an array of objects with name, global, and url properties.`
          );
        }
      } else {
        externals = params.getInfo().externals;
      }

      const viewOptions = {
        ...options,
        plugins: params.plugins,
        htmlTemplate: params.htmlTemplate,
        viewWrapper: params.viewWrapper,
        externals,
      };

      if (
        options.componentPackage.oc.files.template.type === 'oc-template-esm'
      ) {
        return viteEsmView(viewOptions, cb);
      }

      return viteView(viewOptions, cb);
    },
    compileServer: viteServer,
    compileStatics,
    getInfo,
  });
}
