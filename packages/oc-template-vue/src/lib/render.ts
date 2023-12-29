declare const renderVue: any;

import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.vueComponent.src;
    const key = options.model.vueComponent.key;
    const props = options.model.vueComponent.props;
    const extractor = (key: any, context: any) => context.oc.vueComponents[key];
    const getJsFromUrl = createPredicate({
      key,
      url,
      extractor,
    });

    tryGetCached(
      'vueComponent',
      key,
      getJsFromUrl,
      (err: any, CachedApp: any) => {
        if (err) return callback(err);
        try {
          const vueHtml = renderVue(CachedApp(props));

          const html = options.template(
            Object.assign({}, options.model, {
              __html: vueHtml,
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
