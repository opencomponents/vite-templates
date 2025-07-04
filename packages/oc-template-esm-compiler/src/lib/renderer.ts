import type { InitialData } from 'oc-server';

interface RendererOptions {
  mount(element: Element, props: InitialData): void;
  unmount?(): void;
}

export function createComponent(opts: RendererOptions) {
  return opts;
}
