import type { InitialData } from 'oc-server/client';

/**
 * Context passed to a component's `mount` function as the third argument.
 *
 * It tells the component where it is being rendered so it can adapt if needed —
 * in particular whether it lives inside a shadow root (one the template created
 * via `oc.files.template.shadowDOM`, or one owned by the page embedding the
 * component). The template resolves this for you, so components don't have to
 * walk the DOM to discover a shadow root themselves.
 */
export type RendererContext = {
  /**
   * The shadow root the component is rendered inside, or `null` when it renders
   * in the light DOM.
   */
  shadowRoot?: ShadowRoot | null;
  /** The `<style>` element the compiler injected for this component, if any. */
  styleElement?: HTMLStyleElement | null;
  /** The id of the `<style>` element the compiler injected, if any. */
  styleId?: string;
};

export interface RendererOptions {
  mount(element: Element, props: InitialData, context: RendererContext): void;
  unmount?(): void;
}

export function createComponent(
  opts: RendererOptions | (() => RendererOptions)
) {
  return opts;
}

/**
 * Returns the shadow root the given node lives inside, or `null` when it is in
 * the light DOM. Uses the standard `getRootNode()` API rather than manually
 * walking `parentNode`, so closed and nested shadow roots are handled correctly.
 */
export function getShadowRoot(node: Node): ShadowRoot | null {
  const root =
    typeof node.getRootNode === 'function' ? node.getRootNode() : null;
  return root &&
    root.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ &&
    'host' in root
    ? (root as ShadowRoot)
    : null;
}
