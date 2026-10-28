import Fastify from 'fastify';
import fastifyExpress from '@fastify/express';
import { expect, it } from 'vitest';

it('does not bypass inherited middleware in prefixed plugins (CVE-2026-33807)', async () => {
  const app = Fastify();
  try {
    await app.register(fastifyExpress);
    app.use('/admin', (_req, res) => {
      res.statusCode = 403;
      res.end('Forbidden');
    });
    app.register(
      async (child) => {
        child.get('/secret', async () => ({ secret: true }));
      },
      { prefix: '/admin' }
    );
    const origin = await app.listen({ port: 0 });
    const response = await fetch(`${origin}/admin/secret`);
    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Forbidden');
  } finally {
    await app.close();
  }
});
