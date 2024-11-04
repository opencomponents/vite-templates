import { Prettify, ToJson, DataContext, DataProvider } from './types';

export type ServerContext<E = { name: string }, P = any, S = any> = Omit<
  DataContext<any, E, P, S>,
  'params' | 'action' | 'setEmptyResponse'
>;
export type Action<I, O, E, P, S> = (
  params: I,
  ctx: ServerContext<E, P, S>
) => Promise<O> | O;
type AnyAction = Action<any, any, any, any, any>;

type IsGeneralStringName<T> = T extends { name: infer N }
  ? N extends string
    ? string extends N
      ? true
      : false
    : false
  : false;

export class Server<
  E = { name: string },
  P = unknown,
  A extends Record<string, AnyAction> = {},
  InitialInput = any,
  InitialOutput = any,
  MiddlewareInput = any,
  MiddlewareOutput = any
> {
  private _middleware: Action<
    MiddlewareInput,
    MiddlewareOutput,
    E,
    P,
    unknown
  > | null = null;
  constructor() {}

  middleware<I, O>(
    action: Action<I, O, E, P, unknown>
  ): Omit<
    Server<E, P, A, InitialInput, InitialOutput, I, O>,
    P extends Record<string, unknown>
      ? IsGeneralStringName<E> extends false
        ? 'middleware' | 'definePlugins' | 'defineEnv'
        : 'middleware' | 'definePlugins'
      : IsGeneralStringName<E> extends false
      ? 'middleware' | 'defineEnv'
      : 'middleware'
  > {
    this._middleware = action as any;
    return this as any;
  }

  defineEnv<Env>(): P extends Record<string, any>
    ? Omit<
        Server<Env, P, A, InitialInput, InitialOutput>,
        'defineEnv' | 'definePlugins'
      >
    : Omit<Server<Env, P, A, InitialInput, InitialOutput>, 'defineEnv'> {
    return this as any;
  }

  definePlugins<Plugins>(): IsGeneralStringName<E> extends true
    ? Omit<Server<E, Plugins, A, InitialInput, InitialOutput>, 'definePlugins'>
    : Omit<
        Server<E, Plugins, A, InitialInput, InitialOutput>,
        'definePlugins' | 'defineEnv'
      > {
    return this as any;
  }

  handler<I, O>(
    action: Action<I, O, E, P, MiddlewareOutput>
  ): HandledServer<E, P, A, I, O, MiddlewareInput, MiddlewareOutput> {
    return new HandledServer<E, P, A, I, O, MiddlewareInput, MiddlewareOutput>(
      action,
      this._middleware
    );
  }
}

class HandledServer<
  E,
  P,
  A extends Record<string, AnyAction> = {},
  InitialInput = any,
  InitialOutput = any,
  MiddlewareInput = any,
  MiddlewareOutput = any
> {
  public readonly actions: A = {} as any;

  constructor(
    public readonly initial: Action<
      InitialInput,
      InitialOutput,
      E,
      P,
      MiddlewareOutput
    >,
    private readonly _middleware: Action<
      MiddlewareInput,
      MiddlewareOutput,
      E,
      P,
      unknown
    > | null = null
  ) {}

  action<ActionName extends string, I, O>(
    name: ActionName,
    action: Action<I, O, E, P, MiddlewareOutput>
  ): HandledServer<
    E,
    P,
    Prettify<A & Record<ActionName, Action<I, O, E, P, MiddlewareOutput>>>,
    InitialInput,
    InitialOutput,
    MiddlewareInput,
    MiddlewareOutput
  > {
    this.actions[name] = action as any;
    return this;
  }

  getData(): DataProvider<any, any, any> {
    return async (
      { action: actionName, params, setEmptyResponse, ...context },
      cb: any
    ) => {
      let res: any;
      try {
        if (this._middleware) {
          const data = await this._middleware(params, context);
          (context as any).state = data;
        }

        if (actionName && this.actions[actionName]) {
          const data = params?.data ?? params;
          res = await this.actions[actionName](data, context);
        } else {
          res = await this.initial!(params, context as any);
        }
      } catch (err) {
        cb(err);
        return;
      }
      cb(null, res);
    };
  }
}

export interface Register {
  // server: Server
}

export type AnyServer = HandledServer<any, any>;

export type RegisteredServer = Register extends {
  server: infer TServer extends AnyServer;
}
  ? TServer
  : AnyServer;

export type GetMiddlewareInput<TServer extends AnyServer> =
  TServer extends HandledServer<any, any, any, any, any, infer I> ? I : any;
type GetInitialData<TServer extends AnyServer> = TServer extends HandledServer<
  any,
  any,
  any,
  any,
  infer O
>
  ? Exclude<ToJson<O>, undefined | null>
  : any;
export type InitialData = GetInitialData<RegisteredServer>;
export type ComponentSettings = {
  id: string;
  element: HTMLElement;
  staticPath: string;
  baseUrl: string;
  name: string;
  version: string;
};

declare const __$$oc_initialData__: InitialData;
declare const __$$oc_Settings__: ComponentSettings;

export const getInitialData: () => InitialData = () =>
  typeof __$$oc_initialData__ !== 'undefined'
    ? __$$oc_initialData__
    : ({} as any);

export const getSettings: () => ComponentSettings = () =>
  typeof __$$oc_Settings__ !== 'undefined' ? __$$oc_Settings__ : ({} as any);

type ErrorCodes =
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 510
  | 511;
export class ServerError extends Error {
  constructor(public statusCode: ErrorCodes, message: string) {
    super(message);
  }
}
