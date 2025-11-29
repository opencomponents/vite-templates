export default function vueOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import { createApp } from 'vue'
  import View from '${viewPath}';

  let app = null;

  function renderer(props, element, ssr) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;
    ${providerFunctions}

    rest.getData = getData;
    rest.getSetting = getSetting;
    app = createApp(View, rest)
    app.mount(element, ssr);

    element.parentElement.unmount = () => {
      if (app) {
        app.unmount();
        app = null;
      }
    }
  }

  renderer.component = View;

  export default renderer;
`;
}
