import { z } from 'zod';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ADMIN_SESSION_EXPIRED_EVENT, ApiClientError, apiRequest } from './http-client';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('HTTP client', () => {
  it('validates successful responses before returning them', async () => {
    server.use(http.get('http://localhost:3101/v1/resource', () => HttpResponse.json({ id: 42 })));

    await expect(apiRequest('/resource', z.object({ id: z.string() }))).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });

  it('normalizes API errors and expires unauthorized sessions', async () => {
    const expired = vi.fn();
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, expired);
    server.use(http.get('http://localhost:3101/v1/resource', () => HttpResponse.json({
      error: { code: 'UNAUTHORIZED', message: 'Sessão expirada.', correlationId: 'request-1' },
    }, { status: 401 })));

    const error = await apiRequest('/resource', z.object({ ok: z.boolean() })).catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({ status: 401, code: 'UNAUTHORIZED', correlationId: 'request-1' });
    expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expired);
  });
});
