import { createComponent } from 'oc-template-esm-compiler/renderer';
import { createRoot, Root } from 'react-dom/client';
import App from './App';

export default createComponent(() => {
  let root: Root | undefined = undefined;

  return {
    mount(element, props) {
      root = createRoot(element);
      root.render(<App {...props} />);
    },
    unmount() {
      root?.unmount();
    },
  };
});
