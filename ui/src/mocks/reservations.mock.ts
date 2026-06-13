export type ReservationStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type ReservationItem = {
  dateLabel: string;
  experienceId: string;
  id: string;
  locationLabel: string;
  note?: string;
  priceLabel?: string;
  scheduledAt: string;
  status: ReservationStatus;
  timeLabel: string;
  title: string;
};

export const reservationStatusLabelMap: Record<ReservationStatus, string> = {
  requested: 'Solicitada',
  confirmed: 'Confirmada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const reservationStatusPriorityMap: Record<ReservationStatus, number> = {
  in_progress: 0,
  confirmed: 1,
  requested: 2,
  completed: 3,
  cancelled: 4,
};

const monthIndexMap: Record<string, number> = {
  jan: 0,
  fev: 1,
  mar: 2,
  abr: 3,
  mai: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  out: 9,
  nov: 10,
  dez: 11,
};

export function getReservationStatusLabel(status: ReservationStatus) {
  return reservationStatusLabelMap[status];
}

export function buildReservationScheduledAt(dateLabel: string, timeLabel: string) {
  const displayDateLabel = dateLabel.includes(',') ? dateLabel.split(',').pop()?.trim() : dateLabel.trim();
  const [dayToken, monthToken] = (displayDateLabel ?? '').toLowerCase().split(/\s+/);
  const [hourToken = '12', minuteToken = '00'] = timeLabel.split(':');
  const day = Number(dayToken);
  const monthIndex = monthToken ? monthIndexMap[monthToken] : undefined;
  const hours = Number(hourToken);
  const minutes = Number(minuteToken);

  if (
    !Number.isFinite(day) ||
    monthIndex === undefined ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return '';
  }

  const year = new Date().getFullYear();
  return new Date(year, monthIndex, day, hours, minutes, 0, 0).toISOString();
}

function getReservationSortTime(reservation: ReservationItem) {
  const timestamp = Date.parse(reservation.scheduledAt || buildReservationScheduledAt(reservation.dateLabel, reservation.timeLabel));
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function sortReservations(reservations: ReservationItem[]) {
  return [...reservations].sort((left, right) => {
    const statusPriority = reservationStatusPriorityMap[left.status] - reservationStatusPriorityMap[right.status];

    if (statusPriority !== 0) {
      return statusPriority;
    }

    return getReservationSortTime(left) - getReservationSortTime(right);
  });
}

export const reservationsMock: ReservationItem[] = [
  {
    id: 'reservation-sunset-dinner-001',
    experienceId: 'sunset-dinner',
    title: 'Jantar ao pôr do sol',
    status: 'requested',
    dateLabel: 'Hoje, 12 jun',
    timeLabel: '18:30',
    locationLabel: 'Restaurante do hotel',
    priceLabel: 'Sob consulta',
    scheduledAt: '2026-06-12T18:30:00.000Z',
    note: 'A equipe do hotel irá confirmar os detalhes.',
  },
  {
    id: 'reservation-spa-001',
    experienceId: 'spa-wellness',
    title: 'Spa & bem-estar',
    status: 'confirmed',
    dateLabel: 'Amanhã, 13 jun',
    timeLabel: '17:30',
    locationLabel: 'Spa do hotel',
    priceLabel: 'Sob consulta',
    scheduledAt: '2026-06-13T17:30:00.000Z',
    note: 'Chegue alguns minutos antes do horário reservado.',
  },
  {
    id: 'reservation-beach-tour-001',
    experienceId: 'beach-tour',
    title: 'Tour pela orla',
    status: 'in_progress',
    dateLabel: 'Hoje, 12 jun',
    timeLabel: '16:30',
    locationLabel: 'Saída pela recepção',
    priceLabel: 'Sob consulta',
    scheduledAt: '2026-06-12T16:30:00.000Z',
    note: 'A equipe acompanha a saída a partir da recepção.',
  },
  {
    id: 'reservation-breakfast-special-001',
    experienceId: 'breakfast-special',
    title: 'Café da manhã especial',
    status: 'completed',
    dateLabel: 'Ontem, 11 jun',
    timeLabel: '08:00',
    locationLabel: 'Salão de café',
    priceLabel: 'Sob consulta',
    scheduledAt: '2026-06-11T08:00:00.000Z',
    note: 'Experiência finalizada durante a manhã.',
  },
  {
    id: 'reservation-private-dinner-001',
    experienceId: 'private-dinner',
    title: 'Jantar privativo',
    status: 'cancelled',
    dateLabel: 'Amanhã, 13 jun',
    timeLabel: '21:00',
    locationLabel: 'Ambiente privativo',
    priceLabel: 'Sob consulta',
    scheduledAt: '2026-06-13T21:00:00.000Z',
    note: 'Se desejar, o concierge pode ajudar com uma nova opção.',
  },
];
