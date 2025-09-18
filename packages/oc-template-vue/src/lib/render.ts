import { renderToString } from 'vue/server-renderer';
import { createSSRApp } from 'vue';
import { callbackify } from 'util';

import { ssr, type SsrOptions } from './to-be-published/ssr';

export const render = callbackify((options: SsrOptions) => {
  const key = options.key;

  const ssrOptions: SsrOptions = {
    key,
    model: options.model,
    template: options.template,
  };

  const renderer = (CachedApp: any, componentProps: Record<string, any>) => {
    const app = createSSRApp(CachedApp, componentProps);
    return renderToString(app);
  };

  return ssr({
    globals: {},
    componentName: 'vue',
    options: ssrOptions,
    renderer,
  });
});
