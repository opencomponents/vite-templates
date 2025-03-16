export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type JsonPrimitive = string | number | boolean | null | undefined;
type JsonObject = { [key: string]: JsonPrimitive | JsonArray | JsonObject };
interface JsonArray extends Array<JsonPrimitive | JsonArray | JsonObject> {}

type CleanNeverProperties<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type ToJson<T> = T extends Date | RegExp
  ? string
  : T extends Function
  ? never
  : T extends Promise<any>
  ? {}
  : T extends JsonPrimitive
  ? T
  : T extends Array<infer U>
  ? ToJson<U>[]
  : T extends object
  ? { [K in keyof T]: ToJson<T[K]> }
  : never;

export type ToPrettyJson<T> = CleanNeverProperties<Prettify<ToJson<T>>>;

export interface AcceptLanguage {
  code: string;
  script?: any;
  region: string;
  quality: number;
}

export interface Env {
  name: string;
}

export interface External {
  global: string;
  url: string;
  name: string;
}

export interface Template {
  type: string;
  version: string;
  externals: External[];
}

export type DataContext<T = any, E = Env, P = any, S = unknown> = {
  action?: string;
  acceptLanguage: AcceptLanguage[];
  baseUrl: string;
  env: E;
  params: T;
  plugins: P;
  requestHeaders: Record<string, string>;
  requestIp: string;
  setEmptyResponse: () => void;
  setHeader: (header: string, value: string) => void;
  staticPath: string;
  templates: Template[];
} & (S extends Record<string, unknown> ? { state: S } : {});

type Callback<D, E = Error> = (error: E | null, data?: D) => void;

export type DataProvider<Parameters = any, Return = any, Environment = Env> = (
  context: DataContext<Parameters, Environment>,
  callback: Callback<Return>
) => void;

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsAny<T> = IfAny<T, true, never>;
