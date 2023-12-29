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

  function renderer(props, element, ssr) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;
    ${providerFunctions}

    rest.getData = getData;
    rest.getSetting = getSetting;
    createApp(View, rest).mount(element, ssr);
  }

  export default renderer;
`;
}
