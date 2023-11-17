import genericRenderer from 'oc-generic-template-renderer';
import React from 'react';
import ReactDOM from 'react-dom';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export * from './lib/render';
export const getCompiledTemplate = (templateString: string, key: string) =>
  genericRenderer.getCompiledTemplate(templateString, key, {
    React,
    ReactDOM,
  });
export const getInfo = () => genericRenderer.getInfo(packageJson);
