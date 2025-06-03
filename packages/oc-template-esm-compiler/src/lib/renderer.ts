interface RendererOptions {
  mount(element: Element, props: any, ssr: boolean): void;
  unmount(): void;
}

export function createComponent(opts: RendererOptions) {
  return opts;
}
