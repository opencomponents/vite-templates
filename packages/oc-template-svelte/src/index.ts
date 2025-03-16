import fs from 'fs';
import path from 'path';
import genericRenderer from 'oc-generic-template-renderer';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

export * from './lib/render';
export const getCompiledTemplate = genericRenderer.getCompiledTemplate;
export const getInfo = () => genericRenderer.getInfo(packageJson);
