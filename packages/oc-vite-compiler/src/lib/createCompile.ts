'use strict';

import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

function getUnixUtcTimestamp() {
  const d1 = new Date();
  const d2 = new Date(
    d1.getUTCFullYear(),
    d1.getUTCMonth(),
    d1.getUTCDate(),
    d1.getUTCHours(),
    d1.getUTCMinutes(),
    d1.getUTCSeconds(),
    d1.getUTCMilliseconds()
  );

  return Math.floor(d2.getTime());
}

type Callback<T = unknown> = (err: Error | null, data: T) => void;
interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
export interface CompiledViewInfo {
  template: {
    type: string;
    hashKey: string;
    src: string;
  };
  bundle: {
    hashKey: string;
  };
}
type OcOptions = {
  version: string;
  minOcVersion: string;
  packaged: boolean;
  date: number;
  parameters?: Record<string, unknown>;
  files: {
    client?: any;
    data?: string;
    dataProvider?: any;
    env?: string;
    static?: string | string[];
    template: {
      src: string;
      type: string;
      version?: string;
      minOcVersion?: string;
      externals?: Array<{
        name: string;
        global: string | string[];
        url: string;
      }>;
    };
  };
};
export interface CompilerOptions {
  componentPackage: PackageJson & {
    oc: OcOptions;
  };
  componentPath: string;
  minify: boolean;
  ocPackage: PackageJson;
  production: boolean;
  publishPath: string;
  verbose: boolean;
  watch: boolean;
}
export interface CompilerServerOptions extends CompilerOptions {
  compiledViewInfo: CompiledViewInfo;
}

export type CompileView = (
  options: CompilerOptions,
  cb: Callback<CompiledViewInfo>
) => void;
export type CompileServer = (
  options: CompilerServerOptions,
  cb: Callback<{
    type: string;
    hashKey: string;
    src: string;
    parameters?: Record<string, unknown>;
  }>
) => void;
export type CompileStatics = (
  options: CompilerOptions,
  cb: Callback<'ok'>
) => void;
export type GetInfo = () => {
  type: string;
  minOcVersion?: string;
  version: string;
  externals: Array<{
    name: string;
    global: string | string[];
    url: string;
  }>;
};
export type CompileDependencies = {
  compileView: CompileView;
  compileServer: CompileServer;
  compileStatics: CompileStatics;
  getInfo: GetInfo;
};

// OPTIONS
// =======
// componentPath
// componentPackage,
// logger,
// minify
// ocPackage
// production
// publishPath
// verbose,
// watch,
export default function createCompile(dependencies: CompileDependencies) {
  const compileView = promisify(dependencies.compileView);
  const compileServer = promisify(dependencies.compileServer);
  const compileStatics = promisify(dependencies.compileStatics);
  const getInfo = dependencies.getInfo;

  return (options: CompilerOptions, callback: Callback<any>) => {
    const componentPackage = structuredClone(options.componentPackage);
    const ocPackage = options.ocPackage;

    // Main async function to handle the waterfall
    async function compile() {
      // Compile view
      const compiledViewInfo = await compileView(options);
      componentPackage.oc.files.template = compiledViewInfo.template;
      delete componentPackage.oc.files.client;

      // Compile dataProvider
      if (componentPackage.oc.files.data) {
        const compiledServerInfo = await compileServer({
          ...options,
          compiledViewInfo,
        });
        if (compiledServerInfo.parameters) {
          componentPackage.oc.parameters = compiledServerInfo.parameters;
          delete compiledServerInfo.parameters;
        }
        componentPackage.oc.files.dataProvider = compiledServerInfo;
        delete componentPackage.oc.files.data;
      }

      // Compile package.json
      componentPackage.oc.files.template.version = getInfo().version;
      componentPackage.oc.files.template.minOcVersion = getInfo().minOcVersion;
      componentPackage.oc.version = ocPackage.version;
      componentPackage.oc.packaged = true;
      componentPackage.oc.date = getUnixUtcTimestamp();

      if (!componentPackage.oc.files.static) {
        componentPackage.oc.files.static = [];
      }
      if (!Array.isArray(componentPackage.oc.files.static)) {
        componentPackage.oc.files.static = [componentPackage.oc.files.static];
      }

      await fs.writeFile(
        path.join(options.publishPath, 'package.json'),
        JSON.stringify(componentPackage, null, 2)
      );

      await compileStatics(options);

      // Copy .env if available
      const env = componentPackage.oc.files.env;
      if (env) {
        const src = path.join(options.componentPath, env);
        const dest = path.join(options.publishPath, '.env');
        await fs.copyFile(src, dest);
      }

      return componentPackage;
    }

    compile()
      .then((result) => callback(null, result))
      .catch((error) => callback(error as Error, undefined as any));
  };
}
