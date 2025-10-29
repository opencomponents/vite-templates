import type { InitialData } from 'oc-server/client';

type RendererContext = {
  shadowRoot?: ShadowRoot | null;
};

interface RendererOptions {
  mount(element: Element, props: InitialData, context: RendererContext): void;
  unmount?(): void;
}

export function createComponent(opts: RendererOptions | (() => RendererOptions)) {
  if (typeof opts === 'function') {
    return opts();
  }
  return opts;
}
