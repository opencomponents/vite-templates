import Vue from 'vue';
import { renderToString } from 'vue/server-renderer';
import { SsrOptions, ssr } from './to-be-published/ssr';
import { createSSRApp } from 'vue';

import { callbackify } from 'util';

export const render = callbackify((options: SsrOptions) => {
  const renderer = (App: any, initialData: any) =>
    renderToString(createSSRApp(App, initialData));

  return ssr({
    componentName: 'react',
    options,
    renderer,
    globals: {
      Vue,
    },
  });
});
