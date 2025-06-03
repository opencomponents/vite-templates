import { createCompile as genericCompile, GetInfo } from './createCompile';
import compileStatics from 'oc-statics-compiler';
import viteServer from './viteServer';
import viteView, { ViteViewOptions } from './viteView';
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

// Minimum OC version required to support streaming
const minOcVersion = '0.50.0';

export default function createCompile(params: {
  plugins?: PluginOption[];
  viewWrapper?: ViteViewOptions['viewWrapper'];
  htmlTemplate?: ViteViewOptions['htmlTemplate'];
  getInfo: GetInfo;
}) {
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

      return viteView(
        {
          ...options,
          plugins: params.plugins,
          htmlTemplate: params.htmlTemplate,
          viewWrapper: params.viewWrapper,
          externals,
        },
        cb
      );
    },
    compileServer: viteServer,
    compileStatics,
    getInfo,
  });
}
