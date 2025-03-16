export default function svelteOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import { mount } from 'svelte'
  import View from '${viewPath}';

  function renderer(props, element, ssr) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;
    ${providerFunctions}

    rest.getData = getData;
    rest.getSetting = getSetting;
    const app = mount(View, {
      target: element,
      props: rest
    });
  }

  renderer.component = View;

  export default renderer;
`;
}
