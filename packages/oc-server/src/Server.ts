import { Context, DataProvider } from './types';

type ContextWithoutParamsActions<E> = Omit<
  Context<any, E>,
  'params' | 'action'
>;
export type Action<I, O, E> = (
  params: I,
  ctx: ContextWithoutParamsActions<E>
) => Promise<O> | O;
type AnyAction = Action<any, any, any>;

export class Server<
  E,
  A extends Record<string, AnyAction> = {},
  InitialInput = any,
  InitialOutput = any
> {
  actions: A = {} as any;

  constructor(private initial: Action<InitialInput, InitialOutput, E>) {}

  action<ActionName extends string, I, O>(
    name: ActionName,
    action: Action<I, O, E>
  ): Server<
    E,
    A & Record<ActionName, Action<I, O, E>>,
    InitialInput,
    InitialOutput
  > {
    this.actions[name] = action as any;
    return this;
  }

  getData(): DataProvider<any, any, any> {
    return async ({ action: actionName, params, ...context }, cb: any) => {
      let res: any;
      try {
        if (actionName && this.actions[actionName]) {
          const data = params?.data ?? params;
          res = await this.actions[actionName](data, context);
        } else {
          res = await this.initial(params, context);
        }

        cb(null, res);
      } catch (err) {
        cb(err);
      }
    };
  }
}

export interface Register {
  // server: Server
}

export type AnyServer = Server<any, any>;

export type RegisteredServer = Register extends {
  server: infer TServer extends AnyServer;
}
  ? TServer
  : AnyServer;

type GetInitialData<TServer extends AnyServer> = TServer extends Server<
  any,
  any,
  any,
  infer O
>
  ? Exclude<O, undefined | null>
  : any;
export type InitialData = GetInitialData<RegisteredServer>;
