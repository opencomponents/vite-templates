import { getInfo } from 'oc-template-solid';
import solid from 'vite-plugin-solid';
import { createCompile } from 'oc-vite-compiler';
import solidOCProviderTemplate from './solidOCProviderTemplate';

export const compile = createCompile({
  plugins: [solid() as any],
  viewWrapper: solidOCProviderTemplate,
  getInfo
});
