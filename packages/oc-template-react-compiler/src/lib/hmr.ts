import reactPlugin from '@vitejs/plugin-react';

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
  window.__$$oc_Settings__ = Object.freeze({ baseUrl: '/', id: 'root', name: '${name}', staticPath: '/', version: '${version}' });

  window.oc = window.oc || {};
  window.oc.cmd = window.oc.cmd || [];

  import App from "${entry}";
  import React from 'react';
  import { createRoot } from 'react-dom/client';

  const app = React.createElement(App, data);
  const container = document.getElementById('root');
  const root = createRoot(container);

  window.oc.cmd.push(() => {
    root.render(app);
  });
</script>
`;

export { reactPlugin as plugin };
