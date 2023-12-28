import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-solid';
import { viteView, viteServer } from 'oc-vite-compiler';
import solid from 'vite-plugin-solid';

import solidOCProviderTemplate from './solidOCProviderTemplate';

export type CompilerOptions = ReturnType<typeof createCompile>;

export const compile: CompilerOptions = createCompile({
  compileView: (options, cb) =>
    viteView(
      {
        ...options,
        plugins: [solid() as any],
        viewWrapper: solidOCProviderTemplate,
        externals: getInfo().externals
      },
      cb
    ),
  compileServer: viteServer,
  compileStatics,
  getInfo
});
