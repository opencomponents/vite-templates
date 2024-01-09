import http from 'http';

const templates = ['react'];

const templatesRequest = {
  comp: templates.map((template) => ({
    name: `base-component-${template}`,
    version: '1.x.x',
    parameters: { userId: 1 },
  })),
};
async function getData() {
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(templatesRequest),
  }).then((x) => x.json());

  return response;
}
const responses = await getData();

for (const response of responses) {
  const status = response.status;
  if (status !== 200) {
    throw new Error('Got error on response', response?.response?.name);
  }
}

const ssrs = responses.map((response) => response.response.html);

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const componentRequest = pathname.split('/')[1];
  if (templates.includes(componentRequest)) {
    const componentIndex = templates.indexOf(componentRequest);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderHtml(ssrs[componentIndex]));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<html>
    <body>
      <h1>Server running</h1>
      ${templates
        .map((template) => `<a href="/${template}">${template}</a>`)
        .join('')}
    /body>
  </html>`);
});

server.listen(4000, () => {
  console.log('Server running at http://localhost:4000/');
  console.log('React running at http://localhost:4000/react');
});

function renderHtml(body) {
  return `
  <html>
  <head>
  <script>window.oc=window.oc||{};oc.conf=oc.conf||{};oc.conf.templates=(oc.conf.templates||[]).concat([
    {
      "type": "oc-template-es6",
      "version": "1.0.7",
      "externals": []
    },
    {
      "type": "oc-template-react",
      "version": "4.0.1",
      "externals": [
        {
          "global": "React",
          "name": "react",
          "url": "https://unpkg.com/react@18.2.0/umd/react.development.js"
        },
        {
          "global": "ReactDOM",
          "name": "react-dom",
          "url": "https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"
        }
      ]
    }
  ]);</script>
  <script src="//localhost:3000/oc-client/client.js"></script>
  </head>
  <body>
   ${ssr}
  </body>
  </html>
  `;
}
