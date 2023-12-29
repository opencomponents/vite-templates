import request from 'minimal-request';
import vm from 'vm';

type GetJsFromUrlOptions = {
  url: string;
  key: string;
  timeout?: number;
  extractor: (key: string, context: Record<string, any>) => string;
};

const getJsFromUrl =
  ({ url, key, timeout = 5000, extractor }: GetJsFromUrlOptions) =>
  (cb: any) => {
    request(
      {
        url,
        timeout,
      },
      (err: any, jsAsText: any) => {
        if (err) {
          return cb({
            status: err,
            response: {
              error: `request ${url} failed (${jsAsText})`,
            },
          });
        }

        const context = {};

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
        const cached = extractor('vueKey', context);
        cb(null, cached);
      }
    );
  };

export default getJsFromUrl;
