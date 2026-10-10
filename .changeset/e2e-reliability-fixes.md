---
'create-oc': patch
'oc-template-svelte-compiler': patch
'oc-template-solid-compiler': patch
'oc-template-elm-compiler': patch
'oc-template-vue-compiler': patch
'oc-server': patch
'oc-template-esm-compiler': patch
---

Reliability fixes found by the end-to-end suite, which now covers all templates:

- Svelte and Solid providers crashed on load because `element.parentElement.unmount`
  ran at module scope; it now runs inside the renderer like the React provider.
- The Svelte template and compiler used `@sveltejs/vite-plugin-svelte` v5, which
  peer-conflicts with Vite 7; both now use v6.
- The Vue template used `className` instead of `class`, so component styles never
  applied; the Svelte template rendered raw `hobbies` instead of the formatted list.
- The Elm provider dropped `staticPath` from the flags, so `Main.elm` fell back to
  empty initial data; it is now passed through from `_staticPath`.
- The Elm template imported `serverClient` from `'oc-server'` (undefined) instead
  of `'oc-server/client'`, breaking the fun-fact action.
- `oc-server` now declares its `oc-vite-compiler` dependency (previously imported
  without declaring it, which raced the monorepo build), and
  `oc-template-esm-compiler` declares its `oc-server` type dependency.
