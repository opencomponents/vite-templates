import genericRenderer from 'oc-generic-template-renderer';
import path from 'path';
import fs from 'fs';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, './package.json'), 'utf-8')
);

export const getCompiledTemplate = genericRenderer.getCompiledTemplate;
export const getInfo = () => {
  return genericRenderer.getInfo(packageJson);
};
export const render = genericRenderer.render;
