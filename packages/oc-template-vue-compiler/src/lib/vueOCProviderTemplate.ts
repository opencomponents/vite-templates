export default function vueOCProviderTemplate({ viewPath }: { viewPath: string }) {
  return `
  import { createApp } from 'vue'
  import View from '${viewPath}';

  function renderer(props, element, ssr) {
    createApp(View, props).mount(element, ssr);
  }

  export default renderer;
`;
}
