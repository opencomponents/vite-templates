export default function svelteOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import { mount, unmount } from 'svelte'
  import View from '${viewPath}';

  let app = null;

  function renderer(props, element, ssr) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;
    ${providerFunctions}

    rest.getData = getData;
    rest.getSetting = getSetting;
    app = mount(View, {
      target: element,
      props: rest
    });
  }

  element.parentElement.unmount = () => {
    if (app) {
      unmount(app);
      app = null;
    }
  }

  renderer.component = View;

  export default renderer;
`;
}
