import genericRenderer from 'oc-generic-template-renderer';
import path from 'node:path';
import fs from 'node:fs';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf-8')
);

export * from './lib/render.js';
export const getCompiledTemplate = (templateString: string, key: string) =>
  genericRenderer.getCompiledTemplate(templateString, key);
export const getInfo = () => genericRenderer.getInfo(packageJson);
