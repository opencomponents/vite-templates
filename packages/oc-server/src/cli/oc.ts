import { FastifyRequest } from 'fastify';
import { PluginMock } from './get-mocked-plugins';

interface Parameters {
  mandatory: boolean;
  example: string | number | boolean;
}

interface Package {
  name: string;
  version: string;
  oc?: {
    parameters?: Record<string, Parameters>;
    files: {
      data?: string;
      template?: {
        type?: string;
        src?: string;
      };
    };
  };
}

export function getDefaultParams(parameters: Record<string, Parameters>) {
  const defaultParams = (() => {
    let params = {};
    if (parameters) {
      params = Object.fromEntries(
        Object.entries(parameters || {})
          .filter(([, param]) => {
            return !!param.mandatory && 'example' in param;
          })
          .map(([paramName, param]) => [paramName, param.example])
      );
    }

    return params;
  })();

  return defaultParams;
}

export function parsePkg(pkg: Package) {
  const serverEntry = pkg.oc?.files?.data;
  let appEntry = pkg.oc?.files?.template?.src || '';
  if (!appEntry) {
    throw new Error(
      'Missing an entry on your package.json under oc.files.template.src'
    );
  }
  if (!appEntry.startsWith('/')) {
    appEntry = `/${appEntry}`;
  }

  const templateType = pkg.oc?.files?.template?.type;
  if (!templateType) {
    throw new Error(
      'Missing an entry on your package.json under oc.files.template.type'
    );
  }

  return {
    name: pkg.name,
    version: pkg.version,
    serverEntry,
    appEntry,
    templateType,
  };
}

export function getContext(
  plugins: PluginMock[],
  req: FastifyRequest,
  params: any,
  action?: any
) {
  const responseHeaders: Record<string, string> = {};
  const context = {
    action,
    acceptLanguage: req.headers['accept-language'],
    easeUrl: '/',
    env: { name: 'local' },
    params,
    plugins: Object.fromEntries(
      plugins.map((plugin) => [plugin.name, plugin.register.execute])
    ),
    renderComponent: () => {
      throw new Error(
        'renderComponent is not implemented in the server context'
      );
    },
    renderComponents: () => {
      throw new Error(
        'renderComponents is not implemented in the server context'
      );
    },
    requestHeaders: req.headers,
    requestIp: req.ip,
    setEmptyResponse: null,
    staticPath: '/',
    setHeader: (header: string, value: string) => {
      if (!(typeof header === 'string' && typeof value === 'string')) {
        throw new Error('context.setHeader parameters must be strings');
      }

      if (header && value) {
        responseHeaders[header.toLowerCase()] = value;
      }
    },
    templates: 'repository.getTemplatesInfo()',
  };

  return { context, responseHeaders };
}
