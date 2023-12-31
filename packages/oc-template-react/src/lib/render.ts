import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { SsrOptions, ssr } from './to-be-published/ssr';

import { callbackify } from 'util';

export const render = callbackify((options: SsrOptions) => {
  const renderer = (App: any, initialData: any) =>
    ReactDOMServer.renderToString(React.createElement(App, initialData));

  return ssr({
    componentName: 'react',
    options,
    renderer,
    globals: {
      React,
      ReactDOM,
    },
  });
});
