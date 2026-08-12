---
'oc-template-esm-compiler': minor
---

Resolve the shadow root a component is mounted in and expose it on the mount context.

The `mount` context now includes `shadowRoot` (alongside the existing
`styleElement`/`styleId`), populated both when the component creates its own
shadow root via `oc.files.template.shadowDOM` and when the embedding page mounts
the component inside a shadow root it owns. Detection uses `element.getRootNode()`
instead of a manual `parentNode` walk, so closed and nested shadow roots are
handled correctly.

A `getShadowRoot(node)` helper is also exported from
`oc-template-esm-compiler/renderer` for use outside `mount`. The template stays
framework-agnostic: it reports where the component is rendered and leaves all
styling and DOM decisions to the component.
