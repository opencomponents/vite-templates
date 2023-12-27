import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-elm';
import { viteView, viteServer } from 'oc-vite-compiler';
import elm from 'vite-plugin-elm';

import elmOCProviderTemplate from './elmOCProviderTemplate';
import htmlTemplate from './htmlTemplate';

export type CompilerOptions = ReturnType<typeof createCompile>;

export const compile: CompilerOptions = createCompile({
  compileView: (options, cb) =>
    viteView(
      {
        ...options,
        plugins: [elm() as any],
        viewWrapper: ({ viewPath }) => elmOCProviderTemplate({ viewPath, jsPath: undefined }),
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
