import createPredicate from './to-be-published/get-js-from-url';
import tryGetCached from './to-be-published/try-get-cached';

export function render(options: any, callback: any) {
  try {
    const url = options.model.component.src;
    const key = options.model.component.key;
    const flags = options.model.component.props;
    const componentKey = options.model.component.key;
    const extractor = (key: string, context: any) =>
      context.oc.reactComponents[key];
    const getJsFromUrl = createPredicate({
      model: options.model,
      componentKey,
      key,
      url,
      extractor,
    });

    tryGetCached(
      'reactComponent',
      key,
      getJsFromUrl,
      (err: any, CachedApp: any) => {
        if (err) return callback(err);
        try {
          const modelHtml = `${CachedApp}-${flags}`;

          const html = options.template(
            Object.assign({}, options.model, {
              __html: modelHtml,
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
