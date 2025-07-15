import vm from 'vm';

type GetJsFromUrlOptions = {
  model: any;
  url: string;
  key: string;
  componentKey: string;
  globals: Record<string, any>;
  timeout?: number;
  extractor: (key: string, context: Record<string, any>) => string;
};

const getJsFromUrl =
  ({
    model,
    url,
    key,
    componentKey,
    globals,
    timeout = 5000,
    extractor,
  }: GetJsFromUrlOptions) =>
  async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    setTimeout(() => controller.abort(), timeout);

    let jsAsText: string;
    try {
      const response = await fetch(url, { signal });
      jsAsText = await response.text();
    } catch (err) {
      throw {
        status: err,
        response: {
          error: `request ${url} failed`,
        },
      };
    }

    const context = Object.assign({}, globals);

    vm.runInNewContext(
      `
      ${jsAsText}
      oc.components['${key}'](${JSON.stringify(model)});
      oc._element = {innerHTML: ''};
      oc.es6Components['${key}'](${JSON.stringify(
        model.component.props
      )}, oc._element);
      `,
      context
    );

    const cached = extractor(componentKey, context);

    return cached;
  };

export default getJsFromUrl;
