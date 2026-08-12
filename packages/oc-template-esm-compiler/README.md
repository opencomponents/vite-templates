# oc-template-esm-compiler - Compiler module

OC template to compile components of type `oc-template-esm`

## The mount context

Components created with `createComponent` receive a **context** object as the
third argument of `mount(element, props, context)`:

```ts
type RendererContext = {
  // The shadow root the component renders inside, or `null` in the light DOM.
  shadowRoot?: ShadowRoot | null;
  // The <style> element the compiler injected for this component (and its id).
  styleElement?: HTMLStyleElement | null;
  styleId?: string;
};
```

The template resolves `shadowRoot` for you in both cases where a component ends
up inside a shadow root:

- when the component opts into an isolated shadow root itself via
  `oc.files.template.shadowDOM`, and
- when the page embedding the component mounts it inside a shadow root it owns.

Detection uses the standard `element.getRootNode()` API, so closed and nested
shadow roots are handled correctly and components never need to walk `parentNode`
to find the root themselves.

What a component does with that information — where to inject its runtime styles,
where to render portals/overlays so they stay within the shadow boundary — is up
to the component and its rendering libraries. The template only tells it where it
is; it deliberately doesn't reach into the component's styling or DOM.

```tsx
import { createComponent } from 'oc-template-esm-compiler/renderer';
import { createRoot } from 'react-dom/client';
import App from './App';

export default createComponent(() => {
  let root;
  return {
    mount(element, props, { shadowRoot }) {
      root = createRoot(element);
      root.render(<App {...props} shadowRoot={shadowRoot} />);
    },
    unmount() {
      root?.unmount();
    }
  };
});
```

The same detection is exported as a standalone helper if you need it elsewhere:

```ts
import { getShadowRoot } from 'oc-template-esm-compiler/renderer';

const shadowRoot = getShadowRoot(element); // ShadowRoot | null
```
