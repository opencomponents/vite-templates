import { getInfo } from 'oc-template-vue';
import vue from '@vitejs/plugin-vue';
import { createCompile } from 'oc-vite-compiler';
import vueOCProviderTemplate from './vueOCProviderTemplate';

export const compile = createCompile({
  plugins: [vue() as any],
  viewWrapper: vueOCProviderTemplate,
  getInfo
});
