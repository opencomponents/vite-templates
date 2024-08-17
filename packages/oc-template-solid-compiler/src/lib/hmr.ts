import vitePlugin from 'vite-plugin-solid';

export const appBlock = ({
  name,
  version,
  entry
}: {
  name: string;
  version: string;
  entry: string;
}) => `
<div id="root"></div>
<script type="module">
  const data = __INITIAL_DATA__;
  window.__$$oc_initialData__ = Object.freeze(data);
  const settings = Object.freeze({ baseUrl: '/', id: 'root', name: '${name}', staticPath: '/', version: '${version}' });
  window.__$$oc_Settings__ = settings;

  window.oc = window.oc || {};
  window.oc.cmd = window.oc.cmd || [];

  import App from "${entry}";
  import { render } from 'solid-js/web';

  const container = document.getElementById('root');

  window.oc.cmd.push(() => {
    render(() => App(data), container);
    window.oc.events.fire('oc:rendered', { ...settings, element: container,  });
  });
</script>
`;

export { vitePlugin as plugin };
