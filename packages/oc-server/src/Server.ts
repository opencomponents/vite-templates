import {
  Prettify,
  DataContext,
  DataProvider,
  ToPrettyJson,
  IsAnyOrUnknown,
} from './types';

// Simple ANSI color utility function
const styleText = (color: string, text: string): string => {
  const colors = {
    gray: '\x1b[90m',
    reset: '\x1b[0m',
  };
  return `${colors[color as keyof typeof colors] || ''}${text}${colors.reset}`;
};

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

type OcParameter = {
  description?: string;
  mandatory?: boolean;
} & (
  | {
      type: 'string';
      example?: string;
      default?: string;
    }
  | {
      type: 'boolean';
      example?: boolean;
      default?: boolean;
    }
  | {
      type: 'number';
      example?: number;
      default?: number;
    }
);
type OcParameters = Record<string, OcParameter>;

type TransformStringifiedTypeToType<T> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never;

type TransformOcParameters<T extends OcParameters> = Prettify<
  Pick<
    {
      [K in keyof T]: TransformStringifiedTypeToType<T[K]['type']>;
    },
    {
      [K in keyof T]: T[K]['mandatory'] extends true ? K : never;
    }[keyof T]
  > &
    Partial<
      Pick<
        {
          [K in keyof T]: TransformStringifiedTypeToType<T[K]['type']>;
        },
        {
          [K in keyof T]: T[K]['mandatory'] extends true ? never : K;
        }[keyof T]
      >
    >
>;

interface ServerOptions<S extends boolean> {
  /**
   * If true, the server will stream the response to the client.
   * This is useful for long polling or streaming responses.
   * It will also serialize data structures like Map, Set, etc.
   *
   * @default false
   */
  stream?: S;
  development?: {
    /**
     * If true, the server will log the browser console.
     * Useful for AI agents to debug on the terminal.
     *
     * @default false
     */
    console?: boolean;
  };
}

export class Server<
  E = { name: string },
  P = unknown,
  A extends Record<string, AnyAction> = {},
  InitialInput = unknown,
  InitialOutput = unknown,
  MiddlewareInput = any,
  MiddlewareOutput = any,
  Streaming extends boolean = false
> {
  private _parameters: OcParameters = {};
  private _middleware: Action<
    MiddlewareInput,
    MiddlewareOutput,
    E,
    P,
    unknown
  > | null = null;
  constructor(private readonly _options: ServerOptions<Streaming> = {}) {}

  middleware<I = MiddlewareInput, O = MiddlewareOutput>(
    action: Action<I, O, E, P, unknown>
  ): Omit<
    Server<E, P, A, InitialInput, InitialOutput, I, O, Streaming>,
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

  withParameters<T extends OcParameters>(
    params: T
  ): Server<
    E,
    P,
    A,
    TransformOcParameters<T>,
    InitialOutput,
    MiddlewareInput,
    MiddlewareOutput,
    Streaming
  > {
    this._parameters = params;
    return this as any;
  }

  defineEnv<Env>(): P extends Record<string, any>
    ? Omit<
        Server<
          Env,
          P,
          A,
          InitialInput,
          InitialOutput,
          MiddlewareInput,
          MiddlewareOutput,
          Streaming
        >,
        'defineEnv' | 'definePlugins'
      >
    : Omit<
        Server<
          Env,
          P,
          A,
          InitialInput,
          InitialOutput,
          MiddlewareInput,
          MiddlewareOutput,
          Streaming
        >,
        'defineEnv'
      > {
    return this as any;
  }

  definePlugins<Plugins>(): IsGeneralStringName<E> extends true
    ? Omit<
        Server<
          E,
          Plugins,
          A,
          InitialInput,
          InitialOutput,
          MiddlewareInput,
          MiddlewareOutput,
          Streaming
        >,
        'definePlugins'
      >
    : Omit<
        Server<
          E,
          Plugins,
          A,
          InitialInput,
          InitialOutput,
          MiddlewareInput,
          MiddlewareOutput,
          Streaming
        >,
        'definePlugins' | 'defineEnv'
      > {
    return this as any;
  }

  handler<I = InitialInput, O = InitialOutput>(
    action: Action<I, O, E, P, MiddlewareOutput>
  ): HandledServer<
    E,
    P,
    A,
    I,
    O,
    MiddlewareInput,
    MiddlewareOutput,
    Streaming
  > {
    return new HandledServer<
      E,
      P,
      A,
      I,
      O,
      MiddlewareInput,
      MiddlewareOutput,
      Streaming
    >(action, this._middleware, this._parameters, this._options);
  }
}

class HandledServer<
  E,
  P,
  A extends Record<string, AnyAction> = {},
  InitialInput = any,
  InitialOutput = any,
  MiddlewareInput = any,
  MiddlewareOutput = any,
  Streaming extends boolean = false
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
    > | null = null,
    private readonly _parameters: OcParameters = {},
    private readonly _options: ServerOptions<Streaming> = {}
  ) {
    if (this._options.development?.console) {
      (this.actions as any)['$$__oc__server___console__$$'] = (params: {
        message: string;
        level: 'log' | 'error';
      }) => {
        console[params.level]?.(
          `${styleText('gray', '[browser]')} ${params.message}`
        );
      };
    }
  }

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
    MiddlewareOutput,
    Streaming
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
      const stream = !!this._options.stream;
      if (res && (context as any).streamSymbol) {
        res[(context as any).streamSymbol] = stream;
      }

      cb(null, res, { console: !!this._options.development?.console });
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
  infer O,
  any,
  any,
  infer Streaming
>
  ? IsAnyOrUnknown<O> extends never
    ? Streaming extends true
      ? Exclude<O, undefined | null>
      : Exclude<ToPrettyJson<O>, undefined | null>
    : unknown
  : unknown;
type GetHandlerParameters<TServer extends AnyServer> =
  TServer extends HandledServer<any, any, any, infer I, any, any, any, any>
    ? I
    : any;
export type HandlerParameters = GetHandlerParameters<RegisteredServer>;
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
