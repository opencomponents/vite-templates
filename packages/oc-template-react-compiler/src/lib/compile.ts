import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-react';
import { viteView, viteServer } from 'oc-vite-compiler';
import react from '@vitejs/plugin-react';

import reactOCProviderTemplate from './reactOCProviderTemplate';

export type CompilerOptions = ReturnType<typeof createCompile>;

export const compile: CompilerOptions = createCompile({
  compileView: (options, cb) =>
    viteView(
      {
        ...options,
        plugins: [(react as any)()],
        viewWrapper: reactOCProviderTemplate,
        externals: getInfo().externals
      },
      cb
    ),
  compileServer: viteServer,
  compileStatics,
  getInfo
});
