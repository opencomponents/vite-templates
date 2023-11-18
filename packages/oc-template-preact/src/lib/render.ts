import render from 'preact-render-to-string';

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.preactComponent.src;
    const key = options.model.preactComponent.key;
    const props = options.model.preactComponent.props;
    const extractor = (key, context) => context.oc.preactComponents[key];
    const getJsFromUrl = createPredicate({
      key,
      url,
      extractor,
    });

    tryGetCached('preactComponent', key, getJsFromUrl, (err, CachedApp) => {
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
    });
  } catch (err) {
    return callback(err);
  }
}
