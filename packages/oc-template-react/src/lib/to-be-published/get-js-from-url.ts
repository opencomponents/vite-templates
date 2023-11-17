import request from 'minimal-request';
import vm from 'vm';

type GetJsFromUrlOptions = {
  url: string;
  key: string;
  reactKey: string;
  globals: Record<string, any>;
  timeout?: number;
  extractor: (key: string, context: Record<string, any>) => string;
};

const getJsFromUrl =
  ({
    url,
    key,
    reactKey,
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
        oc.components['${key}']();
        `,
            context
          );
        } catch (err) {
          return cb(err);
        }
        const cached = extractor(reactKey, context);
        cb(null, cached);
      }
    );
  };

export default getJsFromUrl;
