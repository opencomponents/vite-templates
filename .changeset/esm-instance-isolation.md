---
'oc-vite-compiler': patch
---

ESM components now evaluate their code once per mounted instance, as the other templates do. Before, every instance of the same component version on a page shared one module scope, so `getInitialData()`, `getSettings()` and `serverClient` returned the last-mounted instance's values when a page mounted the component more than once with different parameters. Module-level state of a component is now per instance; code that must run once per page (for example `customElements.define`) needs a guard. Bundles that cannot be wrapped safely (code-split chunks, top-level `await`) build as before, with a warning.
