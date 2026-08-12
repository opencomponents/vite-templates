const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function esmOCProviderTemplate({
  styleId,
  viewPath,
  production,
  shadowDOM
}: {
  viewPath: string;
  production: boolean;
  styleId?: string;
  shadowDOM?: boolean | 'open' | 'closed';
}) {
  return `
  import Component from '${removeExtension(viewPath)}';
  import { getShadowRoot } from 'oc-template-esm-compiler/renderer';

  export function mount(element, props, ctx = {}) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    __$$oc_initialData__ = rest;
    const id = element.getAttribute('id');
    __$$oc_Settings__ = {id, element, staticPath: _staticPath, baseUrl: _baseUrl, name: _componentName, version: _componentVersion};

   ${
     production
       ? ''
       : `
   if (ctx.development?.console && typeof window !== 'undefined') {
     const methods = ['log', 'error'];
     for (const method of methods) {
      const originalMethod = console[method];
      console[method] = (...args) => {
        originalMethod(...args);
        window.oc?.getAction?.({
          action: '$$__oc__server___console__$$',
          component: _componentName,
          version: _componentVersion,
          baseUrl: _baseUrl,
          parameters: {
            message: args.join(' '),
            level: method,
          }
        })?.catch(() => {});
      }
     }
   }`
   }
    const styleElement = ${styleId ? `document.getElementById('${styleId}')` : 'null'};
    const styleId = ${styleId ? `'${styleId}'` : 'undefined'};
    const methods = typeof Component === 'function' ? Component() : Component;

    ${
      // If shadowDOM is set at build time we attach a shadow root and mount into
      // a container inside it, cloning the styleElement so styles apply in scope.
      // Closed mode returns null on element.shadowRoot; we still pass the value
      // we hold via the context for consumers that need it.
      `
    if (${shadowDOM ? 'true' : 'false'}) {
      const mode = ${shadowDOM === true ? "'open'" : `'${shadowDOM}'`};
      element.innerHTML = '';
      const shadowRoot = element.attachShadow({ mode });
      if (styleElement && shadowRoot) {
        const clone = styleElement.cloneNode(true);
        // Original style element has type='oc/css' so styles dont apply to global scope
        // We remove it in the clone so they work on the shadow root
        clone.removeAttribute('type');
        shadowRoot.appendChild(clone);
      }
      const container = document.createElement('div');
      shadowRoot.appendChild(container);
      element.unmount = () => methods.unmount?.();
      methods.mount(container, rest, { shadowRoot, styleElement, styleId });
      return;
    }
      `
    }

    // The mount element may already live inside a shadow root that the embedding
    // page owns; resolve it so the component can adapt (styles, portals, ...).
    // No shadow root -> light DOM, shadowRoot is null.
    const shadowRoot = getShadowRoot(element);
    element.unmount = () => methods.unmount?.();
    methods.mount(element, rest, { shadowRoot, styleElement, styleId });
  }
`;
}
