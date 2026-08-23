import { describe, expect, it } from 'vitest';
import { stayFormSchema } from './stay-form-schema';

const validStay = {
  useNewGuest: false,
  guestId: 'guest-1',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  roomNumber: '101',
  checkInDate: '2030-01-01',
  checkOutDate: '2030-01-03',
  checkOutTime: '12:00',
  consumptionView: 'ready' as const,
};

describe('stayFormSchema', () => {
  it('accepts an existing guest and a valid period', () => {
    expect(stayFormSchema.safeParse(validStay).success).toBe(true);
  });

  it('requires guest data when creating a new guest', () => {
    const result = stayFormSchema.safeParse({ ...validStay, useNewGuest: true, guestId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(['firstName', 'lastName', 'phoneNumber']));
    }
  });

  it('rejects a check-out before check-in', () => {
    const result = stayFormSchema.safeParse({ ...validStay, checkOutDate: '2029-12-31' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['checkOutDate']);
  });
});
