const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function vueOCProviderTemplate({ viewPath }: { viewPath: string }) {
  return `
  import { createApp } from 'vue'
  import View from '${removeExtension(viewPath)}';

  function renderer(props, element, ssr) {
    createApp(View, props).mount(element, ssr);
  }

  export default renderer;
`;
}
