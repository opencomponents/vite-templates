import { getInfo } from 'oc-template-preact';
import { preact } from '@preact/preset-vite';
import { createCompile } from 'oc-vite-compiler';
import preactOCProviderTemplate from './preactOCProviderTemplate';

export const compile = createCompile({
  plugins: [preact() as any],
  viewWrapper: preactOCProviderTemplate,
  getInfo
});
