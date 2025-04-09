const removeExtension = (path: string) => path.replace(/\.(t|j)sx?$/, '');

export default function reactOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import React from 'react';
  import View from '${removeExtension(viewPath)}';
  import { DataProvider } from 'oc-template-react-compiler/dist/utils/useData'
  import { createRoot, hydrateRoot } from 'react-dom/client';

  function OCProvider(props) {
    const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = props;

    React.useEffect(() => {
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
    if (ssr) {
      hydrateRoot(element, <OCProvider {...props} />);
    } else {
      createRoot(element).render(<OCProvider {...props} />);
    }
  }

  renderer.component = OCProvider;

  export default renderer;
`;
}
