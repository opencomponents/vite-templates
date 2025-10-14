import { createComponent } from "oc-template-esm-compiler/renderer";
import { createRoot, Root } from "react-dom/client";
import App from "./App";

let root: Root | undefined = undefined;

export default createComponent({
  mount(element, props) {
    root = createRoot(element);
    root.render(<App {...props} />);
  },
  unmount() {
    root?.unmount();
  },
});
