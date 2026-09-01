import { describe, expect, it } from 'vitest';
import { reservationFormSchema } from './reservation-form-schema';

describe('reservationFormSchema', () => {
  const validReservation = { stayId: 'stay-1', experienceId: 'experience-1', slotId: 'slot-1', guestNote: '' };

  it('accepts a complete reservation', () => {
    expect(reservationFormSchema.safeParse(validReservation).success).toBe(true);
  });

  it.each(['stayId', 'experienceId', 'slotId'] as const)('requires %s', (field) => {
    expect(reservationFormSchema.safeParse({ ...validReservation, [field]: '' }).success).toBe(false);
  });

  it('limits the optional note', () => {
    expect(reservationFormSchema.safeParse({ ...validReservation, guestNote: 'a'.repeat(501) }).success).toBe(false);
  });
});
