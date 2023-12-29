import {
  createCompile as genericCompile,
  GetInfo,
} from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import viteServer from './viteServer';
import viteView, { ViteViewOptions } from './viteView';
import type { PluginOption } from 'vite';

export default function createCompile(params: {
  plugins?: PluginOption[];
  viewWrapper?: ViteViewOptions['viewWrapper'];
  htmlTemplate?: ViteViewOptions['htmlTemplate'];
  getInfo: GetInfo;
}) {
  return genericCompile({
    compileView: (options, cb) =>
      viteView(
        {
          ...options,
          plugins: params.plugins,
          viewWrapper: params.viewWrapper,
          externals: params.getInfo().externals,
        },
        cb
      ),
    compileServer: viteServer,
    compileStatics,
    getInfo: params.getInfo,
  });
}
