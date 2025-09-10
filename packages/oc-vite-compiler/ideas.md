I'll add the three brief notes to ARCH.md now (externals subpaths, overridable output names, ESM import map), then propose a concise prioritized list of improvements.

[3 tools called]

- Added concise notes to `ARCH.md`:
  - Externals: clarified `externals[].paths` for subpaths.
  - Outputs: noted `publishFileName` override for `template.js` and `server.js`.
  - ESM: documented `oc.files.imports` import-map usage in dev/registry.

Thinking forward — concrete improvements (small → bold):

- Small

  - Typed externals validation: schema-validate `externals` with helpful errors (name/global/url/paths).
  - Source maps: optional accurate view source maps by mapping through the wrapper.
  - Better CSS strategy: toggle external CSS file when size > threshold to avoid HTML bloat.
  - DX logs: surface which deps were externalized versus bundled in server logs.
  - Hashing toggle: option to include wrapper+CSS in hash for stricter caching.

- Medium

  - Built-in nonce/CSP hooks: `htmlTemplate` helpers for nonce attributes and CSP-safe inlining.
  - Import maps first-class: emit `publish/import-map.json`; registry/dev server consumes automatically.
  - Template test harness: a tiny runner to mount SSR+CSR in Node+JSDOM for snapshot/regression.
  - Faster param extraction: parse `_parameters` from AST when static, fall back to exec when dynamic.

- Big
  - Streaming SSR + partial hydration: optional mode using islands for React/Vue/Svelte with consistent client wiring.
  - Cross-component module federation: opt-in shared runtime for vendor chunks loaded once across components.
  - Edge-first server bundles: dual outputs (Node + WinterCG) with adapters (Workers, Deno, Lambda@Edge).
  - Multi-runtime policy: policy file to choose CDN externals vs. bundled per environment/latency budgets.
  - Live contracts: a “param schema + action schema” registry with validation and typed client stubs.
  - Observability hooks: unified tracing (OpenTelemetry), error boundary reporting, and performance beacons per render.
  - Zero-downtime canaries: automatic dual-hash publishing and percentage rollout via registry, with auto-rollback.
  - Design tokens pipeline: shared tokens via CSS custom properties + versioned asset channel to keep MFE UIs coherent.
  - Auth isolation: per-component sandboxing for tokens (postMessage bridge + capability-based access to actions).
  - Offline prefetch: build-time manifest generation for components to allow granular prefetch/prerender strategies.

If any of these resonate, I can sketch the minimal API surface and code touchpoints to implement them next.
