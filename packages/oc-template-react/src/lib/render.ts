import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.reactComponent.src;
    const key = options.key;
    const reactKey = options.model.reactComponent.key;
    const props = options.model.reactComponent.props;
    const extractor = (key: string, context: any) =>
      context.oc.reactComponents[key];
    const getJsFromUrl = createPredicate({
      key,
      reactKey,
      url,
      globals: {
        React,
        ReactDOM,
      },
      extractor,
    });

    tryGetCached('reactComponent', reactKey, getJsFromUrl, (err, CachedApp) => {
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
    });
  } catch (err) {
    return callback(err);
  }
}
