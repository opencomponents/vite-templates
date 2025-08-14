const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function esmOCProviderTemplate({
  viewPath,
  production
}: {
  viewPath: string;
  production: boolean;
}) {
  return `
  import Component from '${removeExtension(viewPath)}';

  export function mount(element, props, context = {}) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    __$$oc_initialData__ = rest;
    const id = element.getAttribute('id');
    __$$oc_Settings__ = {id, element, staticPath: _staticPath, baseUrl: _baseUrl, name: _componentName, version: _componentVersion};

   ${
     production
       ? ''
       : `
   if (context.development?.console && typeof window !== 'undefined') {
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

    element.unmount = () => Component.unmount();
    Component.mount(element, rest);
  }
`;
}
