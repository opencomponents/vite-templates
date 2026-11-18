import vite from 'oc-vite';
import type { PluginOption } from 'oc-vite';

type External = string | RegExp;

// Rolldown keeps require() of externals inside CJS dependencies (react-dom,
// react/jsx-runtime...) as-is, which throws in the browser. Rolldown's
// esmExternalRequirePlugin turns them into imports, but it must own those
// externals, so they are also dropped from `external`, which vite fills from
// vite.config.ts as well.
export function externalsPlugins(external: External[]): PluginOption[] {
  if (!external.length) return [];
  const owned = new Set(external.map(String));

  return [
    vite.esmExternalRequirePlugin({ external }),
    {
      name: 'OcOwnedExternals',
      options(inputOptions) {
        const current = inputOptions.external;
        if (Array.isArray(current)) {
          inputOptions.external = current.filter((x) => !owned.has(String(x)));
        } else if (current !== undefined && owned.has(String(current))) {
          inputOptions.external = [];
        }
      },
    },
  ];
}
