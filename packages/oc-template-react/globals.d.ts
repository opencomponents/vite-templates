declare module 'nice-cache' {
  class Cache {
    constructor(opt: { refreshInterval?: number; verbose?: boolean });

    get(type: string, key: string): any;
    set(type: string, key: string, data: unknown): void;
  }

  export = Cache;
}

declare module 'minimal-request' {
  function request<T>(
    opts: {
      timeout?: number;
      method?: string;
      body?: unknown;
      url: string;
      headers?: Record<string, string | null | undefined | string[]>;
      json?: boolean;
    },
    cb: (
      err: Error | number | null,
      body: T,
      details: {
        response: {
          headers: Record<string, string>;
        };
      }
    ) => void
  ): void;

  const request: Request;

  export = request;
}

// declare module 'oc-generic-template-renderer' {
//   type External = {
//     global: string | string[];
//     url: string;
//   };
//   type PackageJson = {
//     name: string;
//     version: string;
//     externals?: Record<string, External>;
//   };

//   export function getInfo(json: PackageJson): {
//     type: string;
//     version: string;
//     externals: Array<External & { name: string }>;
//   };
//   export var getCompiledTemplate: any;
//   export var render: any;
// }
