const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function preactOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import { render } from 'preact';
  import { useEffect } from 'preact/hooks';
  import View from '${removeExtension(viewPath)}';
  import { DataProvider } from 'oc-template-preact-compiler/dist/utils/useData'

  function OCProvider(props) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    useEffect(() => {
      window.oc.events.fire('oc:componentDidMount', rest);
    }, []);

    ${providerFunctions}
   
    rest.getData = getData;
    rest.getSetting = getSetting;

    return (
      <DataProvider value={{...rest}}>
        <View { ...rest } />
      </DataProvider>
    );
  }

  function renderer(props, element, ssr) {
    render(<OCProvider {...props} />, element);
  }

  renderer.component = OCProvider;

  export default renderer;
`;
}
