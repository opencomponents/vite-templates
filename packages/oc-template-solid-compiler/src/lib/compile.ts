import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-solid';
import { viteView, viteServer } from 'oc-vite-compiler';
import solid from 'vite-plugin-solid';

import solidOCProviderTemplate from './solidOCProviderTemplate';
import htmlTemplate from './htmlTemplate';

export const compile = (createCompile as any)({
  compileView: (options: any, cb: any) =>
    viteView(
      {
        ...options,
        plugins: [solid()],
        viewWrapper: ({ viewPath }) => solidOCProviderTemplate({ viewPath }),
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
