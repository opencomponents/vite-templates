import React from 'react';
import { SsrOptions, ssr } from './to-be-published/ssr';

import { callbackify } from 'util';

export const render = callbackify((options: SsrOptions) => {
  const renderer = (App: any, initialData: any) => {
    throw new Error('Not implemented');
  };

  return ssr({
    componentName: 'react',
    options,
    renderer,
    globals: {},
  });
});
