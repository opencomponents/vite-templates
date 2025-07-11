const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function solidOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import { render } from 'solid-js/web';
  import View from '${removeExtension(viewPath)}';
  import { DataProvider } from 'oc-template-solid-compiler/dist/utils/useData'

  function OCProvider(props) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    ${providerFunctions}

    window.oc.events.fire('oc:componentDidMount', rest);
    rest.getData = getData;
    rest.getSetting = getSetting;

    return (
      <DataProvider value={{...rest}}>
        <View { ...rest } />
      </DataProvider>
    );
  }

  let dispose = null;

  function renderer(props, element, ssr) {
    dispose = render(() => <OCProvider {...props} />, element);
  }

  element.parentElement.unmount = () => {
    if (dispose) {
      dispose();
      dispose = null;
    }
  }

  renderer.component = OCProvider;

  export default renderer;
`;
}
