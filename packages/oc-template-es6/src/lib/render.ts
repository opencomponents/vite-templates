import { SsrOptions, ssr } from './to-be-published/ssr';

import { callbackify } from 'util';

export const render = callbackify((options: SsrOptions) => {
  const renderer = (App: any, initialData: any) => App(initialData);

  return ssr({
    componentName: 'es6',
    options,
    renderer,
    globals: {},
  });
});
