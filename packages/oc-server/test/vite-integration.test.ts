import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { createServer } from '../src/vite/server';

vi.mock('vite', async () => {
  const actual = await vi.importActual<typeof import('vite')>('vite');
  return {
    ...actual,
    createServer: (config: import('vite').InlineConfig) =>
      actual.createServer({
        ...config,
        server: { ...config.server, ws: false },
      }),
  };
});

vi.mock('../src/vite/oc', async () => {
  const actual = await vi.importActual<any>('../src/vite/oc');
  return {
    ...actual,
    parsePkg: () => ({
      name: 'test-component',
      version: '1.0.0',
      appEntry: '/src/index.ts',
    }),
  };
});

vi.mock('../src/vite/get-mocked-plugins', () => ({
  default: () => [],
}));

let app: Awaited<ReturnType<typeof createServer>>;

beforeAll(async () => {
  app = await createServer({
    port: '0',
    template: { appBlock: () => '<main>__INITIAL_DATA__</main>' },
  });
});

afterAll(async () => {
  await app?.close();
});

it('serves real Vite middleware and falls through to OC routes', async () => {
  const baseUrl = app.listeningOrigin;
  const client = await fetch(`${baseUrl}/@vite/client`);
  expect(client.status).toBe(200);
  expect(await client.text()).toContain('WebSocket');

  const preview = await fetch(`${baseUrl}/nested/preview`);
  expect(preview.status).toBe(200);
  expect(await preview.text()).toContain('<main>{}</main>');

  const data = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      components: [{ parameters: { userId: '123' } }],
    }),
  });
  expect(data.status).toBe(200);
  expect(await data.json()).toEqual([
    {
      status: 200,
      response: { data: { component: { props: { userId: '123' } } } },
    },
  ]);
});
