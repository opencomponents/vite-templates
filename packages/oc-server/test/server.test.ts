import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createServer } from '../src/vite/server';

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

vi.mock('oc-vite-compiler/dist/lib/cssModulesPlugin', () => ({
  default: () => ({}),
}));

vi.mock('vite', () => ({
  loadConfigFromFile: async () => null,
  createServer: async () => ({
    middlewares: (
      req: IncomingMessage,
      res: ServerResponse,
      next: () => void
    ) => {
      res.setHeader('x-vite-middleware', 'visited');
      if (req.url === '/src/index.ts') {
        res.setHeader('Content-Type', 'text/javascript');
        res.end('export default "vite asset";');
      } else {
        next();
      }
    },
    transformIndexHtml: async (url: string, html: string) =>
      html.replace('</head>', `<meta name="url" content="${url}"></head>`),
    ssrFixStacktrace: vi.fn(),
    close: vi.fn(),
  }),
}));

describe('development server with Fastify 5', () => {
  let app: Awaited<ReturnType<typeof createServer>>;
  let baseUrl: string;

  const request = async (url: string, payload?: unknown) => {
    const response = await fetch(`${baseUrl}${url}`, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? { 'content-type': 'application/json' } : {},
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const body = await response.text();
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers),
      body,
      json: () => JSON.parse(body),
    };
  };

  beforeAll(async () => {
    app = await createServer({
      port: '0',
      template: {
        appBlock: () => '<main>__INITIAL_DATA__</main>',
      },
    });
    baseUrl = app.listeningOrigin;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serves Vite assets through Express middleware', async () => {
    const response = await request('/src/index.ts');
    expect(response.statusCode).toBe(200);
    expect(response.headers['x-vite-middleware']).toBe('visited');
    expect(response.body).toBe('export default "vite asset";');
  });

  it.each(['/', '/nested/preview?userId=1'])(
    'renders HTML at %s after middleware falls through',
    async (url) => {
      const response = await request(url);
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-vite-middleware']).toBe('visited');
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.body).toContain('<main>{}</main>');
      expect(response.body).toContain(`content="${url}"`);
    }
  );

  it('serves the OC client after middleware falls through', async () => {
    const response = await request('/oc-client/client.js');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/javascript');
    expect(response.body.length).toBeGreaterThan(100);
  });

  it('parses component POST requests after middleware falls through', async () => {
    const response = await request('/', {
      components: [{ parameters: { userId: '123' }, action: 'refresh' }],
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['x-vite-middleware']).toBe('visited');
    expect(response.json()).toEqual([
      {
        status: 200,
        response: { data: { component: { props: { userId: '123' } } } },
      },
    ]);
  });
});
