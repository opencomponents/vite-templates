import { createCompile } from 'oc-generic-template-compiler';
import compileStatics from 'oc-statics-compiler';
import { getInfo } from 'oc-template-es6';
import { viteView, viteServer } from 'oc-vite-compiler';
import { htmlTemplate } from './htmlTemplate';

export const compiler = createCompile({
  compileView: (options, cb) =>
    viteView(
      {
        ...options,
        htmlTemplate,
      },
      cb
    ),
  compileServer: viteServer,
  compileStatics,
  getInfo,
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
