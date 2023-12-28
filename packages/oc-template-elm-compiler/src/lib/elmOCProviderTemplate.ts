const extractName = (path: string) => path.match(/(\w+)\.elm$/)![1];
const removeJsExtension = (path: string) => path.replace(/\.(t|j)s?$/, '');

export default function elmOCProviderTemplate({
  jsPath,
  viewPath
}: {
  jsPath?: string;
  viewPath: string;
}) {
  return `
  import { Elm } from '${viewPath}';
  ${jsPath ? `import jsApp from '${removeJsExtension(jsPath)}'` : ''}

  function getData(providerProps, parameters, cb) {
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
      cb(null, rest);
    });
  }

  function renderer(model, node) {
    const { _baseUrl, _componentName, _componentVersion, _staticPath, ...props } = model;
    const app = Elm["${extractName(viewPath)}"].init({
      node,
      flags: props
    })

    if (app.ports && app.ports.getData) {
      app.ports.getData.subscribe(parameters => {
        getData({ _baseUrl, _componentName, _componentVersion }, parameters, (err, data) => {
          if (err && process.env.NODE_ENV !== 'production') {
            console.error('Error requesting OC Data', err);
          }
          if (app.ports.dataReceiver) {
            app.ports.dataReceiver.send(err || data);
          }
        });
      });
    }

    ${jsPath ? 'jsApp(app);' : ''}

    return app;
  }

  export default renderer;
`;
}