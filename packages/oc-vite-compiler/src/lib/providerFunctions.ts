export const providerFunctions = `
  function _getData(providerProps, parameters, cb) {
    return window.oc.getData(
      {
        name: providerProps._componentName,
        version: providerProps._componentVersion,
        baseUrl: providerProps._baseUrl,
        parameters
      },
      (err, data) => {
        if (err) {
          return cb(err);
        }
        const { _staticPath, _baseUrl, _componentName, _componentVersion, ...rest } =
          data.component.props;
        cb(null, rest, data.component.props);
      }
    );
  }
  
  function _getSetting(providerProps, setting) {
    const settingHash = {
      name: providerProps._componentName,
      version: providerProps._componentVersion,
      baseUrl: providerProps._baseUrl,
      staticPath: providerProps._staticPath
    };
    return settingHash[setting];
  }
  
  const getData = (parameters, cb) => {
    if (!cb || typeof cb !== 'function') {
      return new Promise((resolve, reject) => {
        _getData(props, parameters, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    _getData(props, parameters, cb);
  };
  const getSetting = (setting) => _getSetting(props, setting);
  `;
