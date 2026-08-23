import { describe, expect, it } from 'vitest';
import { adminSessionSchema, stayPageSchema } from './contracts';

describe('API contracts', () => {
  it('accepts a valid admin session', () => {
    const result = adminSessionSchema.safeParse({
      accessToken: 'token',
      expiresAt: '2030-01-01T00:00:00.000Z',
      admin: {
        adminUserId: 'admin-1', name: 'Admin', email: 'admin@atrio.app', role: 'manager',
        permissions: ['stays:read'], hotel: { id: 'hotel-1', name: 'Atrio' },
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects malformed persisted and server data', () => {
    expect(adminSessionSchema.safeParse({ accessToken: '' }).success).toBe(false);
    expect(stayPageSchema.safeParse({ items: 'not-an-array' }).success).toBe(false);
  });
});
