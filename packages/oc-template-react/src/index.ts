import genericRenderer from 'oc-generic-template-renderer';
import React from 'react';
import path from 'path';
import ReactDOM from 'react-dom';
import fs from 'fs';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

export * from './lib/render';
export const getCompiledTemplate = (templateString: string, key: string) =>
  genericRenderer.getCompiledTemplate(templateString, key, {
    React,
    ReactDOM,
  });
export const getInfo = () => genericRenderer.getInfo(packageJson);
