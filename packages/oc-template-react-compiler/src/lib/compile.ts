import { getInfo } from 'oc-template-react';
import react from '@vitejs/plugin-react';
import { createCompile } from 'oc-vite-compiler';
import reactOCProviderTemplate from './reactOCProviderTemplate';

export const compile = createCompile({
  plugins: [react() as any],
  viewWrapper: reactOCProviderTemplate,
  getInfo: getInfo as any
});
