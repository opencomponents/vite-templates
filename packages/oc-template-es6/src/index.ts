import genericRenderer from 'oc-generic-template-renderer';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export const getCompiledTemplate = genericRenderer.getCompiledTemplate;
export const getInfo = () => {
  return genericRenderer.getInfo(packageJson);
};
export const render = genericRenderer.render;
