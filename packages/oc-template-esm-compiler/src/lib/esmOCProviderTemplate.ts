const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function esmOCProviderTemplate({ viewPath }: { viewPath: string }) {
  return `
  import Component from '${removeExtension(viewPath)}';

  function renderer(props, element, ssr) {
    Component.render(props, element, ssr);
  }

  export default renderer;
`;
}
