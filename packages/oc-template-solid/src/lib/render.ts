import render from 'preact-render-to-string';

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.solidComponent.src;
    const key = options.model.solidComponent.key;
    const props = options.model.solidComponent.props;
    const extractor = (key: any, context: any) =>
      context.oc.solidComponents[key];
    const getJsFromUrl = createPredicate({
      key,
      url,
      extractor,
    });

    tryGetCached(
      'solidComponent',
      key,
      getJsFromUrl,
      (err: any, CachedApp: any) => {
        if (err) return callback(err);
        try {
          const preactHtml = render(CachedApp(props));

          const html = options.template(
            Object.assign({}, options.model, {
              __html: preactHtml,
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
