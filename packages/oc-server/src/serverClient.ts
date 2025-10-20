/// <reference types="oc-vite/client" />

import type {
  AnyServer,
  RegisteredServer,
  Action,
  GetMiddlewareInput,
  ComponentSettings,
  InitialData,
} from './Server';
import type { IsAnyOrUnknown, Prettify, ToPrettyJson } from './types';

declare const __$$oc_initialData__: InitialData;
declare const __$$oc_Settings__: ComponentSettings;

export const getInitialData: () => InitialData = () =>
  typeof __$$oc_initialData__ !== 'undefined'
    ? __$$oc_initialData__
    : ({} as any);

export const getSettings: () => ComponentSettings = () =>
  typeof __$$oc_Settings__ !== 'undefined' ? __$$oc_Settings__ : ({} as any);

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
