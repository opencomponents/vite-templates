import { getInfo } from 'oc-template-esm';
import { createCompile } from 'oc-vite-compiler';
import esmOCProviderTemplate from './esmOCProviderTemplate';

export const compile = createCompile({
  plugins: [],
  viewWrapper: esmOCProviderTemplate,
  getInfo
});
