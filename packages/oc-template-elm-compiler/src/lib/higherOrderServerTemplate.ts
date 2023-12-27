const removeTsExtension = (path) => path.replace(/\.tsx?$/, '');

const higherOrderServerTemplate = ({
  serverPath,
  bundleHashKey,
  componentName,
  componentVersion
}) => `
import { data as dataProvider } from '${removeTsExtension(serverPath)}';

export const data = (context : any, callback : (error: any, data?: any) => void) => {
  dataProvider(context, (error: any, model: any) => {
    if (error) {
      return callback(error);
    }
    const flags = Object.assign({}, model, {
      _staticPath: context.staticPath,
      _baseUrl: context.baseUrl,
      _componentName: "${componentName}",
      _componentVersion: "${componentVersion}"
    });
    const srcPathHasProtocol = context.staticPath.indexOf("http") === 0;
    const srcPath = srcPathHasProtocol ? context.staticPath : ("https:" + context.staticPath);
    return callback(null, Object.assign({}, {
      elmComponent: {
        key: "${bundleHashKey}",
        src: srcPath + "elm-component.js",
        flags
      }
    }));
  });
}
`;

module.exports = higherOrderServerTemplate;
