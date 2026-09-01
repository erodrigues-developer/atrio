import { isStayAppAccessible, localDateKey } from './stay-access-window.util';

describe('stay app access window', () => {
  const stay = {
    checkInDate: '2026-08-27',
    checkOutDate: '2026-08-28',
    status: 'scheduled',
    hotel: { timezone: 'America/Sao_Paulo' },
  };

  it('starts at local midnight on check-in day', () => {
    expect(isStayAppAccessible(stay, new Date('2026-08-27T02:59:59.999Z'))).toBe(false);
    expect(isStayAppAccessible(stay, new Date('2026-08-27T03:00:00.000Z'))).toBe(true);
  });

  it('ends after 23:59:59 on the local checkout day', () => {
    expect(isStayAppAccessible(stay, new Date('2026-08-29T02:59:59.999Z'))).toBe(true);
    expect(isStayAppAccessible(stay, new Date('2026-08-29T03:00:00.000Z'))).toBe(false);
  });

  it('rejects operationally ended or cancelled stays', () => {
    expect(isStayAppAccessible({ ...stay, status: 'checked_out' }, new Date('2026-08-27T12:00:00Z'))).toBe(false);
    expect(isStayAppAccessible({ ...stay, status: 'cancelled' }, new Date('2026-08-27T12:00:00Z'))).toBe(false);
  });

  it('formats dates in the hotel timezone', () => {
    expect(localDateKey(new Date('2026-08-27T02:59:59Z'), 'America/Sao_Paulo')).toBe('2026-08-26');
  });
});

