/// <reference types="oc-vite/client" />

import {
  AnyServer,
  RegisteredServer,
  Action,
  getSettings,
  GetMiddlewareInput,
} from './Server';
import { IsAnyOrUnknown, Prettify, ToPrettyJson } from './types';

type InferInput<R> = R extends Action<infer I, any, any, any, any> ? I : any;
type InferOutput<R> = R extends Action<any, infer O, any, any, any>
  ? ToPrettyJson<O>
  : never;

type IsEmptyObject<T> = keyof T extends never ? true : false;

type ServerClient<TServer extends AnyServer> = {
  readonly [Property in keyof TServer['actions']]: (
    ...args: IsEmptyObject<
      Prettify<
        InferInput<TServer['actions'][Property]> &
          (IsAnyOrUnknown<GetMiddlewareInput<TServer>> extends never
            ? GetMiddlewareInput<TServer>
            : {})
      >
    > extends true
      ? [options?: { signal?: AbortSignal }]
      : [
          Prettify<
            InferInput<TServer['actions'][Property]> &
              (IsAnyOrUnknown<GetMiddlewareInput<TServer>> extends never
                ? GetMiddlewareInput<TServer>
                : {})
          >,
          options?: { signal?: AbortSignal }
        ]
  ) => Promise<InferOutput<TServer['actions'][Property]>>;
};

export const serverClient: ServerClient<RegisteredServer> = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return (data?: any, options?: { signal?: AbortSignal }) => {
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
          signal: options?.signal,
        });
      };
    },
  }
);

export type ActionOutput<K extends keyof typeof serverClient> = Awaited<
  ReturnType<(typeof serverClient)[K]>
>;
