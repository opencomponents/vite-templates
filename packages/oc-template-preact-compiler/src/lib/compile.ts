import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-preact';
import { viteView, viteServer } from 'oc-vite-compiler';
import { preact } from '@preact/preset-vite';

import preactOCProviderTemplate from './preactOCProviderTemplate';

export type CompilerOptions = ReturnType<typeof createCompile>;

export const compile: CompilerOptions = createCompile({
  compileView: (options, cb) =>
    viteView(
      {
        ...options,
        plugins: [preact() as any],
        viewWrapper: preactOCProviderTemplate,
        externals: getInfo().externals
      },
      cb
    ),
  compileServer: viteServer,
  compileStatics,
  getInfo
});
