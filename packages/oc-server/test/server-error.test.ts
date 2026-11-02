import { describe, expect, it } from 'vitest';
import { Server, ServerError } from '../src/Server';

const run = (provider: any, input: Record<string, unknown>) =>
  new Promise<{ err: any; data: any }>((resolve) => {
    provider(input, (err: any, data: any) => resolve({ err, data }));
  });

describe('ServerError', () => {
  it('exposes the code as both statusCode and status', () => {
    const error = new ServerError(401, 'Unauthorized');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
    // The OC registry takes the HTTP status from `status`.
    expect(error.status).toBe(401);
  });

  it('reaches the registry with its status when thrown from middleware', async () => {
    const provider = new Server()
      .middleware(async () => {
        throw new ServerError(401, 'Unauthorized');
      })
      .handler(async () => ({ ok: true }))
      .getData();

    const { err, data } = await run(provider, { params: {} });

    expect(err.status).toBe(401);
    expect(err.message).toBe('Unauthorized');
    expect(data).toBeUndefined();
  });

  it('reaches the registry with its status when thrown from an action', async () => {
    const provider = new Server()
      .handler(async () => ({ ok: true }))
      .action('save', async () => {
        throw new ServerError(403, 'Forbidden');
      })
      .getData();

    const { err } = await run(provider, { action: 'save', params: {} });

    expect(err.status).toBe(403);
  });
});
