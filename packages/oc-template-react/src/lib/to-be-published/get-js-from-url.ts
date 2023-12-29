import request from 'minimal-request';
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
  (cb: any) => {
    request(
      {
        url,
        timeout,
      },
      (err, jsAsText) => {
        if (err) {
          return cb({
            status: err,
            response: {
              error: `request ${url} failed (${jsAsText})`,
            },
          });
        }

        const context = Object.assign({}, globals);

        try {
          vm.runInNewContext(
            `
        ${jsAsText}
        oc.components['${key}'](${JSON.stringify(model)});
        `,
            context
          );
        } catch (err) {
          return cb(err);
        }
        const cached = extractor(componentKey, context);
        cb(null, cached);
      }
    );
  };

export default getJsFromUrl;
