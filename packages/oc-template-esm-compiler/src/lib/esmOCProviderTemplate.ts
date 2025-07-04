const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function esmOCProviderTemplate({ viewPath }: { viewPath: string }) {
  return `
  import Component from '${removeExtension(viewPath)}';

  export function mount(element, props) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    Component.mount(element, rest);
  }
`;
}
