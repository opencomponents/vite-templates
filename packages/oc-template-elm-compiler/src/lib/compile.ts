import { getInfo } from 'oc-template-elm';
import elm from 'vite-plugin-elm';
import { createCompile } from 'oc-vite-compiler';
import elmOCProviderTemplate from './elmOCProviderTemplate';

export const compile = createCompile({
  plugins: [elm() as any],
  viewWrapper: elmOCProviderTemplate,
  getInfo
});
