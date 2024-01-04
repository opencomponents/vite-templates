import { getInfo } from 'oc-template-es6';
import { createCompile } from 'oc-vite-compiler';

export const compile = createCompile({
  getInfo,
});
