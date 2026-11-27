import { BrowserHost } from '@effect/ui/html';
import { Effect, Layer } from 'effect';
import type { Fiber } from 'effect/Fiber';
import { createComponent } from 'oc-template-esm-compiler/renderer';
import { App } from './App';

export default createComponent(() => {
  let fiber: Fiber<never, never> | undefined;

  return {
    mount(element, props) {
      fiber?.interruptUnsafe();
      fiber = Effect.runFork(
        Layer.launch(
          BrowserHost.mount(App, props, element, {
            // An OC component is embedded in a host page, so it must not own
            // the document head. The element id keeps generated ids unique
            // when the same component is mounted more than once.
            head: false,
            key: element.getAttribute('id') ?? undefined,
          })
        )
      );
    },
    unmount() {
      fiber?.interruptUnsafe();
      fiber = undefined;
    },
  };
});
