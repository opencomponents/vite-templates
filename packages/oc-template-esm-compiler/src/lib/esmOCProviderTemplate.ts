const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function esmOCProviderTemplate({ viewPath }: { viewPath: string }) {
  return `
  import Component from '${removeExtension(viewPath)}';

  export function mount(element, props) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    __$$oc_initialData__ = rest;
    const id = element.getAttribute('id');
    __$$oc_Settings__ = {id, element, staticPath: _staticPath, baseUrl: _baseUrl, name: _componentName, version: _componentVersion};

    Component.mount(element, rest);
  }
`;
}
