import { getInfo } from 'oc-template-esm';
import esmOCProviderTemplate from './esmOCProviderTemplate.js';
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url);
const { createCompile } = require('oc-vite-compiler');

export const compile = createCompile({
  plugins: [],
  viewWrapper: esmOCProviderTemplate,
  getInfo
});
