import { describe, expect, it } from 'vitest';
import {
  adminSessionSchema,
  dashboardSchema,
  experiencePageSchema,
  guestPageSchema,
  reservationPageSchema,
  servicePageSchema,
  serviceRequestPageSchema,
  stayPageSchema,
} from './contracts';

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
    for (const schema of [
      stayPageSchema,
      guestPageSchema,
      servicePageSchema,
      serviceRequestPageSchema,
      experiencePageSchema,
      reservationPageSchema,
    ]) {
      expect(schema.safeParse({ items: 'not-an-array' }).success).toBe(false);
    }
  });

  it('normalizes a null dashboard movement schedule returned by PostgreSQL', () => {
    const result = dashboardSchema.parse({
      hotelId: 'hotel-1',
      hotelName: 'Atrio',
      metrics: [],
      todayMetrics: [],
      attentionMetrics: [],
      alerts: [],
      pendingRequests: [],
      pendingExperiences: [],
      conciergeConversations: [],
      upcomingMovements: [{
        id: 'checkin-stay-1',
        timeLabel: 'Hoje',
        type: 'check-in',
        title: 'Mariana Costa',
        helper: 'Quarto 305',
        scheduledAt: null,
      }],
    });

    expect(result.upcomingMovements[0]?.scheduledAt).toBeUndefined();
  });
});
