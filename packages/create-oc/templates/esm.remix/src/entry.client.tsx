import { createComponent } from 'oc-template-esm-compiler/renderer';
import { createRoot } from '@remix-run/dom';
import App from './App';

export default createComponent(() => {
  let root: ReturnType<typeof createRoot> | undefined = undefined;

  return {
    mount(element) {
      root = createRoot(element as HTMLElement);
      root.render(<App />);
    },
    unmount() {
      root?.remove();
    },
  };
});
