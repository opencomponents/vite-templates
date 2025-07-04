import { type SsrOptions, ssr } from './to-be-published/ssr.js';

import { callbackify } from 'util';

export const render = callbackify((options: SsrOptions) => {
  const renderer = (App: any, initialData: any) => {
    throw new Error('Not implemented');
  };

  return ssr({
    componentName: 'esm',
    options,
    renderer,
    globals: {},
  });
});
