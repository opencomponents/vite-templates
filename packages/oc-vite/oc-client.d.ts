// Users can augment this interface to add their own events
interface OcEvents {}

type OCNativeEvents = {
  'oc:rendered': {
    baseUrl: string;
    html: string;
    id: string;
    element: HTMLElement;
    key: string;
    name: string;
    version: string;
  };
  'oc:ready': OC;
  'oc:cssDidMount': string;
  'oc:componentDidMount': {
    [key: string]: any;
    getSetting: (
      key: 'id' | 'name' | 'version' | 'baseUrl' | 'staticPath'
    ) => string;
  };
  'oc:failed': {
    originalError: any;
    data: any;
    component: HTMLElement;
  };
};

type OCListener<K extends keyof (OcEvents & OCNativeEvents)> = (
  evt: { type: string },
  data: K extends keyof OcEvents
    ? OcEvents[K]
    : K extends keyof OCNativeEvents
    ? OCNativeEvents[K]
    : never
) => void;

type OCFire<K extends keyof OcEvents> = (
  evt: { type: string },
  data: OcEvents[K]
) => void;

interface OCEvents {
  on<K extends keyof (OcEvents & OCNativeEvents) | (string & {})>(
    eventName: K,
    fn: K extends keyof (OcEvents & OCNativeEvents)
      ? OCListener<K>
      : (...args: any[]) => void
  ): void;
  off<K extends keyof (OcEvents & OCNativeEvents) | (string & {})>(
    eventName: K,
    fn?: K extends keyof (OcEvents & OCNativeEvents)
      ? OCListener<K>
      : (...args: any[]) => void
  ): void;
  fire<K extends keyof OcEvents | (string & {})>(
    eventName: K,
    data?: K extends keyof OcEvents ? OcEvents[K] : any
  ): void;
  reset(): void;
}

interface OC {
  $: JQueryStatic;
  addStylesToHead: (styles: string) => void;
  build: (options: {
    baseUrl: string;
    name: string;
    version?: string;
    parameters?: Record<string, string>;
  }) => string;
  clientVersion: string;
  cmd: {
    push: (cb: (oc: OC) => void) => void;
  };
  components: Record<string, (model: any) => string>;
  conf: {
    templates: Array<{
      type: string;
      externals: string[];
    }>;
  };
  /**
   * OC events API. Users can add their own events via declaration-merging
   * by augmenting `OCEventMap`. Events whose name starts with the `"oc:"`
   * prefix are considered internal: they are available for `on`/`off` but
   * intentionally omitted from the autocompletion of `fire`.
   */
  events: OCEvents;
  getData: (
    options: {
      action?: string;
      parameters: Record<string, string>;
      version: string;
      name: string;
      baseUrl: string;
      json?: boolean;
    },
    cb: (err: any, data: any) => void
  ) => void;
  getAction: (options: {
    component: string;
    action?: string;
    parameters?: Record<string, any>;
    version?: string;
    baseUrl?: string;
    signal?: AbortSignal;
  }) => void;
  load: (
    placeholder: string,
    href: string,
    callback?: (el: HTMLElement) => void
  ) => void;
  ready: (cb: () => void) => void;
  registerTemplates: any;
  render: (
    compiledViewInfo: { type: string; key: string; src: string },
    model: any,
    callback: (err: any, html: string) => void
  ) => void;
  renderByHref: (
    href: string,
    retryNumberOrCallback: number | Function,
    callback: (err: string, data: any) => void
  ) => void;
  renderedComponents: Record<string, { baseUrl: string; version: string }>;
  renderNestedComponent: (ocElement: HTMLElement, cb: () => void) => void;
  renderUnloadedComponents: () => void;
  require: (
    name: string,
    version: string,
    cb: (err: any, component: any) => void
  ) => void;
  requireSeries: (
    toLoad: Array<{ global: string; url: string }>,
    loaded: Array<{ global: string; url: string }>,
    cb: () => void
  ) => void;
  status: string;
}

interface Window {
  oc: OC;
}

