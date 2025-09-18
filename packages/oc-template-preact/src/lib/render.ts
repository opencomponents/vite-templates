import { renderToString } from 'preact-render-to-string';
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
    return renderToString(CachedApp(componentProps));
  };

  return ssr({
    globals: {},
    componentName: 'preact',
    options: ssrOptions,
    renderer,
  });
});
