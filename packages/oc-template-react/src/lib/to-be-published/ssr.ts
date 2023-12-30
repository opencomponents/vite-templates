import createPredicate from './get-js-from-url';
import tryGetCached from './try-get-cached';

export interface SsrOptions {
  key: string;
  model: {
    component: {
      src: string;
      key: string;
      props: Record<string, any>;
    };
  };
  template: (model: any) => string;
}

export async function ssr({
  globals,
  componentName,
  options,
  renderer,
}: {
  globals: Record<string, any>;
  componentName: string;
  options: SsrOptions;
  renderer: (CachedApp: any, props: Record<string, any>) => string;
}) {
  const props = options.model.component.props;
  const url = options.model.component.src;
  const key = options.key;
  const componentKey = options.model.component.key;
  const extractor = (key: string, context: any) =>
    context.oc.reactComponents[key].component;
  const getJsFromUrl = createPredicate({
    model: options.model,
    key,
    componentKey,
    url,
    globals,
    extractor,
  });
  const CachedApp = await tryGetCached(
    `${componentName}Component`,
    componentKey,
    getJsFromUrl
  );

  const componentHtml = renderer(CachedApp, props);

  const html = options.template(
    Object.assign({}, options.model, {
      __html: componentHtml,
    })
  );

  return html;
}
