import { DataContext, DataProvider } from './types';

export type ServerContext<E = { name: string }, P = any> = Omit<
  DataContext<any, E, P>,
  'params' | 'action' | 'setEmptyResponse'
>;
export type Action<I, O, E> = (
  params: I,
  ctx: ServerContext<E>
) => Promise<O> | O;
type AnyAction = Action<any, any, any>;

export class Server<
  E,
  A extends Record<string, AnyAction> = {},
  InitialInput = any,
  InitialOutput = any
> {
  public readonly actions: A = {} as any;

  constructor(
    public readonly initial: Action<InitialInput, InitialOutput, E>
  ) {}

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
    return async (
      { action: actionName, params, setEmptyResponse, ...context },
      cb: any
    ) => {
      let res: any;
      try {
        if (actionName && this.actions[actionName]) {
          const data = params?.data ?? params;
          res = await this.actions[actionName](data, context);
        } else {
          res = await this.initial(params, context);
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
export type ComponentSettings = {
  id: string;
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
