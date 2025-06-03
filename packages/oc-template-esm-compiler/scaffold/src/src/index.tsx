import { createRoot, Root } from 'react-dom/client';
import App from './App';
import { InitialData } from 'oc-server';

///// TEMPORARY START
interface RendererOptions {
  mount(element: Element, props: InitialData, ssr: boolean): void;
  unmount(): void;
}

declare function createComponent(opts: RendererOptions): RendererOptions;
///// TEMPORARY END

let root: Root | undefined = undefined;

export default createComponent({
  mount(element, props) {
    root = createRoot(element);
    root.render(<App {...props} />);
  },
  unmount() {
    root?.unmount();
  }
});
