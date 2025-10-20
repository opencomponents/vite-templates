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
    let shadowRoot = undefined;
    ${
      // If shadowRootMode is set at build time, attach a shadow root and mount into it
      // We also clone the styleElement into the shadow root when present
      // Closed mode returns null on element.shadowRoot; we still pass the value we hold
      // via local variable for consumers that need it.
      // Note: we mount into a container div to not clobber host shadow contents.
      // If no shadowRootMode, mount into light DOM as before.
      `
    if (${shadowDOM ? 'true' : 'false'}) {
      const mode = ${shadowDOM === true ? "'open'" : `'${shadowDOM}'`};
      element.innerHTML = '';
      shadowRoot = element.attachShadow({ mode });
      if (styleElement && shadowRoot) {
        const clone = styleElement.cloneNode(true);
        // Original style element has type='oc/css' so styles dont apply to global scope
        // We remove it in the clone so they work on the shadow root
        clone.removeAttribute('type');
        shadowRoot.appendChild(clone);
      }
      const container = document.createElement('div');
      shadowRoot.appendChild(container);
      element.unmount = () => Component.unmount?.();
      Component.mount(container, rest, { shadowRoot });
      return;
    }
      `
    }

    element.unmount = () => Component.unmount?.();
    Component.mount(element, rest, { styleElement, styleId, shadowRoot: null });
  }
`;
}
