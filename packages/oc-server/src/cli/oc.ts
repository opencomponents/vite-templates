import getMockedPlugins, { PluginMock } from './get-mocked-plugins';
import path from 'path';
import type { Request } from 'express';

interface Package {
  name: string;
  version: string;
  oc?: {
    parameters?: Record<
      string,
      {
        mandatory: boolean;
        example: string | number | boolean;
      }
    >;
    files: {
      data?: string;
      template?: {
        type?: string;
        src?: string;
      };
    };
  };
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

  const defaultParams = (() => {
    let params = {};
    if (pkg.oc?.parameters) {
      params = Object.fromEntries(
        Object.entries(pkg.oc.parameters || {})
          .filter(([, param]) => {
            return !!param.mandatory && 'example' in param;
          })
          .map(([paramName, param]) => [paramName, param.example])
      );
    }

    return params;
  })();
  const templateType = pkg.oc?.files?.template?.type;
  if (!templateType) {
    throw new Error(
      'Missing an entry on your package.json under oc.files.template.type'
    );
  }

  return {
    name: pkg.name,
    version: pkg.version,
    defaultParams,
    serverEntry,
    appEntry,
    templateType,
  };
}

export function getContext(
  plugins: PluginMock[],
  req: Request,
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
