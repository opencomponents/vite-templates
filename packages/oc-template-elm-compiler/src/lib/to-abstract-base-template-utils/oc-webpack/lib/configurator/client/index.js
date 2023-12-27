'use strict';

const webpack = require('webpack');

module.exports = (options) => {
  const buildPath = options.buildPath || '/build';
  const isEnvProduction = !!options.production;
  const isEnvDevelopment = !isEnvProduction;

  return {
    context: options.componentPath,
    mode: isEnvProduction ? 'production' : 'development',
    bail: isEnvProduction,
    optimization: {
      // https://webpack.js.org/configuration/optimization/
      // Override production mode optimization for minification
      // As it currently breakes the build, still rely on babel-minify-webpack-plugin instead
      minimize: isEnvProduction
    },
    entry: options.viewPath,
    output: {
      path: buildPath,
      pathinfo: isEnvDevelopment,
      filename: options.publishFileName,
      futureEmitAssets: true,
      libraryTarget: 'assign',
      library: 'module'
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [
            {
              test: /\.elm$/,
              exclude: [/elm-stuff/, /node_modules/],
              loader: 'elm-webpack-loader',
              options: {
                cwd: options.componentPath
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isEnvProduction ? 'production' : 'development')
      })
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json']
    }
  };
};
