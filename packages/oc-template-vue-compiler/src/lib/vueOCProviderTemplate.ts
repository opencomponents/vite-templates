export default function vueOCProviderTemplate({ viewPath }: { viewPath: string }) {
  return `
  import { createApp } from 'vue'
  import View from '${viewPath}';

  function getDataCb(providerProps, parameters, cb) {
    return window.oc.getData({
      name: providerProps._componentName,
      version: providerProps._componentVersion,
      baseUrl: providerProps._baseUrl,
      parameters
    }, (err, data) => {
      if (err) {
        return cb(err);
      }
      const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } = data.component.props;
      cb(null, rest, data.component.props);
    });
  }

  function getSetting(providerProps, setting) {
    const settingHash = {
      name: providerProps._componentName,
      version: providerProps._componentVersion,
      baseUrl: providerProps._baseUrl,
      staticPath: providerProps._staticPath
    };
    return settingHash[setting];
  }


  function renderer(props, element, ssr) {
    function getData(params) {
      return new Promise((resolve, reject) => {
        getDataCb(props, params, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    props.getData = getData;
    props.getSetting = (setting) => getSetting(props, setting);
    createApp(View, props).mount(element, ssr);
  }

  export default renderer;
`;
}
