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

type CompiledTemplate = (model: unknown) => string;
type RenderOriginal = (
  options: { model: unknown; template: CompiledTemplate },
  cb: (err: Error | null, data: string) => void
) => void;
type Render = (
  options: { model: unknown; template: CompiledTemplate },
  cb: (err: Error | null, data: string) => void
) => void;

const r: Render = render;
