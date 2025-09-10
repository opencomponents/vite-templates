import type { InitialData } from 'oc-server';

type RendererContext = {
  shadowRoot?: ShadowRoot | null;
};

interface RendererOptions {
  mount(element: Element, props: InitialData, context: RendererContext): void;
  unmount?(): void;
}

export function createComponent(opts: RendererOptions) {
  return opts;
}
