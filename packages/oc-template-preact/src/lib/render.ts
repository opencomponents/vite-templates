import preactRender from 'preact-render-to-string';

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.component.src;
    const key = options.model.component.key;
    const componentKey = options.model.component.key;
    const props = options.model.component.props;
    const extractor = (key: any, context: any) =>
      context.oc.preactComponents[key];
    const getJsFromUrl = createPredicate({
      model: options.model,
      key,
      componentKey,
      url,
      extractor,
    });

    tryGetCached('preactComponent', key, getJsFromUrl, (err, CachedApp) => {
      if (err) return callback(err);
      try {
        const preactHtml = preactRender(CachedApp(props));

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
