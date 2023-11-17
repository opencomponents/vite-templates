const removeExtension = (path: string) => path.replace(/\.(j|t)sx?$/, '');

export type ServerWrapper = (options: {
  serverPath: string;
  componentName: string;
  componentVersion: string;
  bundleHashKey: string;
}) => string;

const higherOrderServerTemplate: ServerWrapper = ({
  serverPath,
  componentName,
  componentVersion,
  bundleHashKey,
}) => {
  return `
import { data as dataProvider } from '${removeExtension(serverPath)}';

export const data = (context : any, callback : (error: any, data?: any) => void) => {
  dataProvider(context, (error: any, model: any) => {
    if (error) {
      return callback(error);
    }
    const props = Object.assign({}, model, {
      _staticPath: context.staticPath,
      _baseUrl: context.baseUrl,
      _componentName: "${componentName}",
      _componentVersion: "${componentVersion}"
    });
    const srcPathHasProtocol = context.staticPath.indexOf("http") === 0;
    const srcPath = srcPathHasProtocol ? context.staticPath : ("https:" + context.staticPath);
    return callback(null, Object.assign({}, {
      component: {
        key: "${bundleHashKey}",
        src: srcPath + "template.js",
        props
      }
    }));
  });
}
`;
};

export default higherOrderServerTemplate;
