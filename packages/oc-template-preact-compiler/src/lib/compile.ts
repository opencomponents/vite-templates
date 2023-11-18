'use strict';

import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-preact';
import { viteView, viteServer } from 'oc-vite-compiler';
import { preact } from '@preact/preset-vite';

import preactOCProviderTemplate from './preactOCProviderTemplate';
import htmlTemplate from './htmlTemplate';

export type CompilerOptions = ReturnType<typeof createCompile>;

export const compiler: CompilerOptions = createCompile({
  compileView: (options, cb) =>
    viteView(
      {
        ...options,
        plugins: [preact() as any],
        viewWrapper: ({ viewPath }) => preactOCProviderTemplate({ viewPath }),
        htmlTemplate,
        externals: getInfo().externals
      },
      cb
    ),
  compileServer: viteServer,
  compileStatics,
  getInfo
});

// OPTIONS
// =======
// componentPath
// componentPackage,
// logger,
// minify
// ocPackage
// publishPath
// verbose,
// watch,
// production
