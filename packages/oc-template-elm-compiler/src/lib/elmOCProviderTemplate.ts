const extractName = (path: string) => path.match(/(\w+)\.elm$/)![1];
const removeJsExtension = (path: string) => path.replace(/\.(t|j)s?$/, '');

function elmEntry({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  return `
  import { Elm } from '${viewPath}';

  export default function renderer(props, node) {
    const { _baseUrl, _componentName, _componentVersion, _staticPath, ...rest } = props;
    const app = Elm["${extractName(viewPath)}"].init({
      node,
      flags: rest
    })

    ${providerFunctions}

    if (app.ports && app.ports.getData) {
      app.ports.getData.subscribe(parameters => {
        getData(parameters, (err, data) => {
          if (err && process.env.NODE_ENV !== 'production') {
            console.error('Error requesting OC Data', err);
          }
          if (app.ports.dataReceiver) {
            app.ports.dataReceiver.send(err || data);
          }
        });
      });
    }

    return app;
  }
`;
}

function jsEntry({ viewPath, providerFunctions }: { viewPath: string; providerFunctions: string }) {
  return `
  import config from '${removeJsExtension(viewPath)}';
  const { js, program } = config;

  if (!program) throw new Error('Missing program in config');
  if (!program.init) throw new Error('Program does not look like an elm instance (missing init)');

  export default function renderer(props, node) {
    const { _baseUrl, _componentName, _componentVersion, _staticPath, ...rest } = props;
    const app = program.init({
      node,
      flags: rest
    })

    ${providerFunctions}

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

    js && js(app);

    return app;
  }
`;
}

export default function elmOCProviderTemplate({
  viewPath,
  providerFunctions
}: {
  viewPath: string;
  providerFunctions: string;
}) {
  if (viewPath.endsWith('.elm')) {
    return elmEntry({ viewPath, providerFunctions });
  }
  return jsEntry({ viewPath, providerFunctions });
}
