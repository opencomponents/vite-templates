import { getInfo } from 'oc-template-svelte';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createCompile } from 'oc-vite-compiler';
import svelteOCProviderTemplate from './svelteOCProviderTemplate';

export const compile = createCompile({
  plugins: [svelte() as any],
  viewWrapper: svelteOCProviderTemplate,
  getInfo
});
