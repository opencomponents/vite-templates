import path from 'path';
import fs from 'fs';

interface OcJsonConfig {
  registries?: string[];
  mocks?: {
    plugins?: {
      dynamic?: Record<string, string>;
      static?: Record<string, string>;
    };
  };
}

interface MockedPlugin {
  register: (options: unknown, dependencies: unknown, next: () => void) => void;
  execute: (...args: unknown[]) => unknown;
}

export interface PluginMock {
  name: string;
  register: {
    register: (
      options: unknown,
      dependencies: unknown,
      next: () => void
    ) => void;
    execute: (...args: unknown[]) => unknown;
  };
}

const readJsonSync = (path: string) =>
  JSON.parse(fs.readFileSync(path, 'utf-8'));

const isMockValid = (
  plugin: unknown
): plugin is MockedPlugin | ((...args: unknown[]) => unknown) => {
  const isFunction = typeof plugin === 'function';
  const isValidObject =
    !!plugin &&
    typeof plugin === 'object' &&
    typeof (plugin as MockedPlugin).register === 'function' &&
    typeof (plugin as MockedPlugin).execute === 'function';

  return isFunction || isValidObject;
};

const defaultRegister = (
  _options: unknown,
  _dependencies: unknown,
  next: () => void
) => {
  next();
};

const registerStaticMocks = (mocks: Record<string, string>): PluginMock[] =>
  Object.entries(mocks).map(([pluginName, mockedValue]) => {
    return {
      name: pluginName,
      register: {
        register: defaultRegister,
        execute: () => mockedValue,
      },
    };
  });

const registerDynamicMocks = (
  ocJsonLocation: string,
  mocks: Record<string, string>
) =>
  Object.entries(mocks)
    .map(([pluginName, source]) => {
      let pluginMock: any;
      try {
        pluginMock = require(path.resolve(ocJsonLocation, source));
      } catch (er) {
        return;
      }

      if (!isMockValid(pluginMock)) {
        return;
      }

      const register = (pluginMock as MockedPlugin).register || defaultRegister;
      const execute = (pluginMock as MockedPlugin).execute || pluginMock;

      return {
        name: pluginName,
        register: { execute, register },
      };
    })
    .filter((pluginMock): pluginMock is PluginMock => !!pluginMock);

const findPath = (
  pathToResolve: string,
  fileName: string
): string | undefined => {
  const rootDir = fs.realpathSync('.');
  const fileToResolve = path.join(pathToResolve, fileName);

  if (!fs.existsSync(fileToResolve)) {
    if (pathToResolve === rootDir) {
      return undefined;
    }
    const getParent = (pathToResolve: string) =>
      pathToResolve.split('/').slice(0, -1).join('/');

    const parentDir = pathToResolve ? getParent(pathToResolve) : rootDir;

    return findPath(parentDir, fileName);
  }

  return fileToResolve;
};

export default function getMockedPlugins(componentsDir: string): PluginMock[] {
  componentsDir = path.resolve(componentsDir || '.');

  let plugins: PluginMock[] = [];
  const ocJsonFileName = 'oc.json';
  const ocJsonPath = findPath(componentsDir, ocJsonFileName);

  if (!ocJsonPath) {
    return plugins;
  }

  const content: OcJsonConfig = readJsonSync(ocJsonPath);
  const ocJsonLocation = ocJsonPath.slice(0, -ocJsonFileName.length);

  if (!content.mocks || !content.mocks.plugins) {
    return plugins;
  }

  plugins = plugins.concat(
    registerStaticMocks(content.mocks.plugins.static ?? {})
  );
  plugins = plugins.concat(
    registerDynamicMocks(ocJsonLocation, content.mocks.plugins.dynamic ?? {})
  );

  return plugins;
}
