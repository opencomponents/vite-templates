import { renderToString } from 'solid-js/web';

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.component.src;
    const key = options.key;
    const componentKey = options.model.component.key;
    const props = options.model.component.props;
    const extractor = (key: any, context: any) =>
      context.oc.solidComponents[key].component;
    const getJsFromUrl = createPredicate({
      key,
      url,
      extractor,
      componentKey,
      model: options.model,
    });

    tryGetCached(
      'solidComponent',
      key,
      getJsFromUrl,
      (err: any, CachedApp: any) => {
        if (err) return callback(err);
        try {
          const solidHtml = renderToString(() => CachedApp(props));

          const html = options.template(
            Object.assign({}, options.model, {
              __html: solidHtml,
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
