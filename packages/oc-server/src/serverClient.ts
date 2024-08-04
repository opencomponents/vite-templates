/// <reference types="oc-vite/client" />

import {
  AnyServer,
  RegisteredServer,
  Action,
  getSettings,
  GetMiddlewareInput,
} from './Server';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type IsAny<T> = IfAny<T, true, never>;

type InferInput<R> = R extends Action<infer I, any, any, any, any> ? I : any;
type InferOutput<R> = R extends Action<any, infer O, any, any, any> ? O : never;

type ServerClient<TServer extends AnyServer> = {
  readonly [Property in keyof TServer['actions']]: (
    input: Prettify<
      InferInput<TServer['actions'][Property]> &
        (IsAny<GetMiddlewareInput<TServer>> extends never
          ? GetMiddlewareInput<TServer>
          : {})
    >
  ) => Promise<InferOutput<TServer['actions'][Property]>>;
};

export const serverClient: ServerClient<RegisteredServer> = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return (data: any) => {
        const componentName = 'COMPONENT_NAME';
        const componentVersion = 'COMPONENT_VERSION';
        const baseUrl =
          getSettings().baseUrl ??
          window.oc?.renderedComponents?.[componentName]?.baseUrl;

        return window.oc.getAction({
          action: prop,
          baseUrl,
          component: componentName,
          version: componentVersion,
          parameters: data,
        });
      };
    },
  }
);

export type ActionOutput<K extends keyof typeof serverClient> = Awaited<
  ReturnType<(typeof serverClient)[K]>
>;
