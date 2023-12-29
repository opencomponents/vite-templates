import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.component.src;
    const key = options.key;
    const componentKey = options.model.component.key;
    const props = options.model.component.props;
    const extractor = (key: string, context: any) =>
      context.oc.reactComponents[key].component;
    const getJsFromUrl = createPredicate({
      model: options.model,
      key,
      componentKey,
      url,
      globals: {
        React,
        ReactDOM,
      },
      extractor,
    });

    tryGetCached(
      'reactComponent',
      componentKey,
      getJsFromUrl,
      (err, CachedApp) => {
        if (err) return callback(err);
        try {
          const reactHtml = ReactDOMServer.renderToString(
            React.createElement(CachedApp, props)
          );

          const html = options.template(
            Object.assign({}, options.model, {
              __html: reactHtml,
            })
          );
          return callback(null, html);
        } catch (error) {
          return callback(error);
        }
      }
    );
  } catch (err) {
    return callback(err);
  }
}
