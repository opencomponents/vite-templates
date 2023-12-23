import { AnyServer, RegisteredServer, Action } from './Server';

type InferInput<R> = R extends Action<infer I, any, any> ? I : any;
type InferOutput<R> = R extends Action<any, infer O, any> ? O : never;

type ServerClient<TServer extends AnyServer> = {
  readonly [Property in keyof TServer['actions']]: (
    input: InferInput<TServer['actions'][Property]>
  ) => Promise<InferOutput<TServer['actions'][Property]>>;
};

function getAction<T>(options: {
  action: string;
  componentName: string;
  componentVersion: string;
  baseUrl: string;
  parameters: Record<string, any>;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    (window as any).oc.getData(
      {
        action: options.action,
        name: options.componentName,
        version: options.componentVersion,
        baseUrl: options.baseUrl,
        parameters: options.parameters,
      },
      (err: Error | null, data: { component: { props: any } }) => {
        if (err) {
          return reject(err);
        }
        const {
          _staticPath,
          _baseUrl,
          _componentName,
          _componentVersion,
          ...rest
        } = data.component.props;

        resolve(rest);
      }
    );
  });
}

declare const window: Window & {
  oc?: {
    renderedComponents: Record<string, { baseUrl: string; version: string }>;
  };
};

export const serverClient: ServerClient<RegisteredServer> = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return (data: any) => {
        const componentName = 'COMPONENT_NAME';
        const componentVersion = 'COMPONENT_VERSION';
        const baseUrl =
          window.oc?.renderedComponents?.[componentName]?.baseUrl ?? '/';

        return getAction({
          action: prop,
          baseUrl,
          componentName,
          componentVersion,
          parameters: {
            data,
          },
        });
      };
    },
  }
);
