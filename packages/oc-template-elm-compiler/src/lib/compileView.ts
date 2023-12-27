'use strict';

const async = require('async');
const fs = require('fs-extra');
const hashBuilder = require('oc-hash-builder');
const MemoryFS = require('memory-fs');
const ocViewWrapper = require('oc-view-wrapper');
const path = require('path');
const strings = require('oc-templates-messages');

const elmComponentWrapper = (hash, content, nameSpace) => {
  nameSpace = nameSpace || 'oc';
  return `var ${nameSpace}=${nameSpace}||{};${nameSpace}.elmComponents=${nameSpace}.elmComponents||{};${nameSpace}.elmComponents['${hash}']=${nameSpace}.elmComponents['${hash}']||(function(){var ${content}
	; return module.default}())`;
};

const {
  compiler,
  configurator: { client: webpackConfigurator }
} = require('./to-abstract-base-template-utils/oc-webpack');

const fontFamilyUnicodeParser = require('./to-abstract-base-template-utils/font-family-unicode-parser');
const elmOCProviderTemplate = require('./elmOCProviderTemplate');
const viewTemplate = require('./viewTemplate');

module.exports = (options, callback) => {
  const viewFileName = options.componentPackage.oc.files.template.src;
  const jsFileName = options.componentPackage.oc.files.template.js;
  const componentPath = options.componentPath;
  let viewPath = path.join(options.componentPath, viewFileName);
  let jsPath = jsFileName && path.join(options.componentPath, viewFileName);
  if (process.platform === 'win32') {
    viewPath = viewPath.split('\\').join('\\\\');
    jsPath = jsPath && jsPath.split('\\').join('\\\\');
  }
  const publishPath = options.publishPath;
  const tempPath = path.join(publishPath, 'temp');
  const publishFileName = options.publishFileName || 'template.js';
  const componentPackage = options.componentPackage;
  const production = options.production;

  const elmOCProviderContent = elmOCProviderTemplate({ viewPath, jsPath });
  const elmOCProviderName = 'elmOCProvider.js';
  const elmOCProviderPath = path.join(tempPath, elmOCProviderName);

  const compile = (options, cb) => {
    const config = webpackConfigurator({
      componentPath,
      viewPath: options.viewPath,
      publishFileName,
      production,
      buildIncludes: componentPackage.oc.files.template.buildIncludes || []
    });
    compiler(config, (err, data) => {
      if (err) {
        return cb(err);
      }

      const memoryFs = new MemoryFS(data);
      const bundle = memoryFs.readFileSync(`/build/${config.output.filename}`, 'UTF8');

      const bundleHash = hashBuilder.fromString(bundle);
      const bundleName = 'elm-component';
      const bundlePath = path.join(publishPath, `${bundleName}.js`);
      const wrappedBundle = elmComponentWrapper(bundleHash, bundle);
      fs.outputFileSync(bundlePath, wrappedBundle);

      let css = null;
      if (data.build['main.css']) {
        // This is an awesome hack by KimTaro that will blow your mind.
        // Remove it once this get merged: https://github.com/webpack-contrib/css-loader/pull/523
        css = fontFamilyUnicodeParser(memoryFs.readFileSync(`/build/main.css`, 'UTF8'));

        const cssPath = path.join(publishPath, `styles.css`);
        // We convert single quotes to double quotes in order to
        // support the viewTemplate's string interpolation
        fs.outputFileSync(cssPath, css.replace(/'/g, '"'));
      }

      const elmRoot = `oc-elmRoot-${componentPackage.name}`;
      const templateString = viewTemplate({
        elmRoot,
        css,
        bundleHash,
        bundleName
      });

      const templateStringCompressed = production
        ? templateString.replace(/\s+/g, ' ')
        : templateString;
      const hash = hashBuilder.fromString(templateStringCompressed);
      const view = ocViewWrapper(hash, templateStringCompressed);
      return cb(null, {
        template: { view, hash },
        bundle: { hash: bundleHash }
      });
    });
  };

  async.waterfall(
    [
      (next) => fs.outputFile(elmOCProviderPath, elmOCProviderContent, next),
      (next) => compile({ viewPath: elmOCProviderPath }, next),
      (compiled, next) => fs.remove(elmOCProviderPath, (err) => next(err, compiled)),
      (compiled, next) => fs.ensureDir(publishPath, (err) => next(err, compiled)),
      (compiled, next) =>
        fs.writeFile(path.join(publishPath, publishFileName), compiled.template.view, (err) =>
          next(err, compiled)
        )
    ],
    (err, compiled) => {
      if (err) {
        return callback(strings.errors.compilationFailed(viewFileName, err));
      }
      callback(null, {
        template: {
          type: options.componentPackage.oc.files.template.type,
          hashKey: compiled.template.hash,
          src: publishFileName
        },
        bundle: { hashKey: compiled.bundle.hash }
      });
    }
  );
};
