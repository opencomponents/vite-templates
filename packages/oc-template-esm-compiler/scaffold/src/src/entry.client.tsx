import { createComponent } from 'oc-template-esm-compiler/renderer';
import { createRoot } from '@remix-run/dom';
import App from './App';

let root: ReturnType<typeof createRoot> | undefined = undefined;

export default createComponent({
  mount(element) {
    root = createRoot(element as HTMLElement);
    root.render(<App />);
  },
  unmount() {
    root?.remove();
  },
});
