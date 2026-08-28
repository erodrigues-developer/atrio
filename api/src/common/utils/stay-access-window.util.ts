import { Stay } from 'src/modules/stays/entities/stay.entity';

const DEFAULT_HOTEL_TIME_ZONE = 'America/Sao_Paulo';

export type StayAccessWindow = Pick<Stay, 'checkInDate' | 'checkOutDate' | 'status'> & {
  hotel?: { timezone?: string | null };
};

export function localDateKey(date: Date, timeZone = DEFAULT_HOTEL_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${value.year}-${value.month}-${value.day}`;
}

/**
 * App access follows the local calendar days of the stay. Hotel operation times
 * are deliberately not used here: they are informational for the guest.
 */
export function isStayAppAccessible(stay: StayAccessWindow, now = new Date()): boolean {
  if (!['scheduled', 'active'].includes(stay.status)) {
    return false;
  }

  const currentLocalDate = localDateKey(now, stay.hotel?.timezone ?? DEFAULT_HOTEL_TIME_ZONE);

  return currentLocalDate >= stay.checkInDate && currentLocalDate <= stay.checkOutDate;
}

