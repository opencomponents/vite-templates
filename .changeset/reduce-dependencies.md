---
'oc-vite-compiler': patch
---

Drop the unused `find-package-json` dependency and replace `builtin-modules` with Node's built-in `module.builtinModules`.
