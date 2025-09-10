Here is a **developer-focused rewrite** of the guide.  
It keeps the essential architectural facts, but strips the tutorial-tone, removes repetition, and collapses verbose tables into dense bullet lists.  
Skimmable headers + inline code give you a quick mental model of the repo; deep links are still there if you need them.

---

# oc-vite-compiler – Architecture Cheatsheet

Entry point: `createCompile` returns a Node-style `(options, cb) => void` that produces a `publish/` folder ready to be pushed to an OC registry.

Three build phases (all async, run in order):

1. **View** (`viteView.ts`) – Vite + Rollup → IIFE `template.js` (client bundle).
2. **Server** (`viteServer.ts`) – Vite + Rollup → CJS `server.js` (data provider).
3. **Statics** (`compileStatics`, template-supplied) – copy extra assets.

After view + server, `createCompile` writes `publish/package.json` (hashes, OC metadata, parameters), then copies statics.

---

## 1. View Build (`viteView.ts`)

_Input_  
`oc.files.template.src` – your framework entry (e.g. `src/app.tsx`).  
`externals` – map of bare imports → global vars (UMD) or bare ESM.  
`plugins` – Vite plugins (JSX, Vue, etc.).  
`viewWrapper` – optional fn that returns the code wrapping the framework root.  
`htmlTemplate` – fn that returns the **JS source** of  
`function(model){ return '<div>...</div>' }` (not HTML!).

_Output_  
`template.js` (default name) – IIFE that registers itself at  
`oc.<templateName>Components[hash]` and renders into `<oc-component data-id="…">`.  
`bundle.hashKey` – content hash used for cache-busting.  
Optional `<staticFolder>/…` – non-CSS assets emitted by Rollup.
`publishFileName` – override output filename (default `template.js`).

_Key implementation moves_

- Writes a temp `_viewWrapperEntry.(js|ts)` that imports your code and exposes `(props, element, isSsr)`.
- CSS is concatenated + inlined; everything else is written to disk.
- `renderBuiltUrl` rewrites dynamic `new URL('./foo.png', import.meta.url)` to  
  `__toOcStaticPathUrl('foo.png')` at runtime.
- Dev-only (when `model.component.development`): injects a `console.log/error` proxy that posts back to the server via hidden action `$$__oc__server___console__$$`.

---

## 2. Server Build (`viteServer.ts`)

_Input_  
`oc.files.data` – server entry (e.g. `src/server.ts`).  
`compiledViewInfo.bundle.hashKey` – injected into wrapper so server can tell client which bundle it belongs to.  
`plugins` – usually same as view, minus HMR.  
`serverWrapper` – optional fn that generates the higher-order entry.

_Output_  
`server.js` – CommonJS exporting standard OC data provider  
`(context, callback) => void`.  
`hashKey` – independent hash of server code.  
`parameters` – runtime schema extracted from `server._parameters`.
`publishFileName` – override output filename (default `server.js`).

_Hard checks_

- Any bare import must be in `dependencies` or Node core – fails fast.
- `oc-server` is forced **internal** (not externalised) so runtime wrappers work.

_Parameter extraction_  
Temp file `server.cjs` is `require()`d; `_parameters` read; file deleted.  
If `package.json` declares `oc.parameters`, a yellow warning is printed and server schema wins.

---

## 3. Orchestrator (`createCompile.ts`)

- Promisifies the three compile steps, mutates a **copy** of `package.json`, writes it to `publish/`.
- Adds `oc.packaged=true`, `oc.date=Date.now()`, `oc.version` (OC container), plus the hashes returned by view & server.
- Static folder list is normalised to array; first entry is used by view bundler for extra assets.

---

## 4. Template Integration

Template packages (React, Vue, …) only need to supply:

```ts
export const compile = createCompile({
  plugins: [react()],
  viewWrapper: reactOCProviderTemplate, // mounts React root
  getInfo: () => ({
    type: 'oc-template-react',
    version,
    minOcVersion,
    externals,
  }),
});
```

Everything else is handled by the core compiler.

---

## 5. Hashing & Caching

- View hash covers the pre-wrapped IIFE only (excludes wrapper/CSS).
- Server hash covers **server bundle only**.
- Changing externals, wrapper, or dev/prod flag → new hash → new URL → automatic CDN invalidation.

---

## 6. Externals & Globals

_View side_  
`externals: [{ name: 'react', global: 'React', url: 'https://cdn/18/react.production.min.js' }]`  
→ Rollup leaves `import React from 'react'` untouched; runtime loader (`oc.requireSeries`) injects the script and maps `window.React` into the bundle.
Use `externals[].paths` to map subpaths to the same global (e.g. `react/jsx-runtime`).

_Server side_  
Only packages listed in `dependencies` (or Node core) may be imported; others fail at build time.

---

## 7. Runtime Data Flow (Non-ESM)

1. Server executes `data(context, cb)` → returns `{ component: { props, key, src, esm? } }`.
2. OC registry injects the HTML produced by `htmlTemplate(props)` (see next section).
3. Browser loads externals, then calls  
   `oc.<templateName>Components[key](props, targetElement, hadSSR)`.

---

## 8. `htmlTemplate` Contract

Must return **JavaScript source** of a function:

```js
function(model) {
  return `
    <div id="react-123">` + (model.__html || '') + `</div>
    <style>` + escapeCSS(css) + `</style>
    <script>
      oc.${templateName}Components['` + hash + `'] = (` + bundleIIFE + `);
      oc.cmd.push(function(oc){
        oc.requireSeries(` + JSON.stringify(externals) + `, function(){
          oc.${templateName}Components['` + hash + `'](oc.__data['` + model.id + `'], document.getElementById('react-123'));
        });
      });
    </script>
  `;
}
```

- `model.__html` = optional SSR markup.
- CSS is always inlined; other assets live at `_staticPath`.
- Script block is deferred via `oc.cmd` queue until externals resolve.

---

## 9. ESM Template Path (opt-in)

Set `type: 'oc-template-esm'`.

_View_ – bundle stays ESM, must export `mount(element, props, context)`.  
_Client runtime_ – `import(src)` then `mount(...)`. Built asset URLs are resolved at runtime via `window.oc._esm['<name>@<version>'](filename)`.  
No `htmlTemplate` invocation; registry returns plain `<script type="module">`.
_Imports_ – `oc.files.imports` is written to `publish/package.json` and can be used as an import map source in dev/registry.

---

## 10. Dev Server (`oc-server dev`)

- Fastify + Vite middleware.
- View HMR via Vite; **server code is NOT watched** (restart required).
- Parameter schema re-extracted on every restart (same VM trick).
- Serves `oc-client.js`, renders POST `/` for actions, GET `/` for full page.

---

## 11. Common Gotchas

- **Windows paths** – already escaped; don’t touch.
- **Source maps** – disabled for view (wrapper shifts lines); inline for server in dev.
- **CSS only** – inlined; big files bloat HTML – consider externalising if >50 kB.
- **Missing dep** – build fails fast; add to `dependencies`, not `devDependencies`.
- **Two hash fields** – `template.hashKey === bundle.hashKey` (legacy duplication; ignore).

---

## 12. Extension Points

| Hook            | Use Case                                                  |
| --------------- | --------------------------------------------------------- |
| `plugins`       | Add framework plugins, MDX, SVG, etc.                     |
| `viewWrapper`   | Custom mount/hydrate logic (React 18, Preact signals, …). |
| `serverWrapper` | Inject middleware, tracing, auth.                         |
| `htmlTemplate`  | Change HTML shape, add nonce, preload hints.              |
| `externals`     | Offload vendor code to CDN.                               |

---

That’s the entire pipeline in ~2 pages.  
For deeper internals (streaming, security, roadmap) see the long-form doc – the sections are still valid, just moved out of the fast path.
