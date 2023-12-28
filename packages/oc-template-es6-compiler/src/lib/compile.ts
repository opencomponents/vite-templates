import { getInfo } from 'oc-template-es6';
import { htmlTemplate } from './htmlTemplate';

import { createCompile } from 'oc-vite-compiler';

export const compile = createCompile({
  htmlTemplate,
  getInfo,
});
