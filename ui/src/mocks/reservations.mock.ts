export type ReservationStatus = 'Confirmada' | 'Pendente' | 'Precisa de atenção' | 'Solicitada';

export type ReservationItem = {
  dateLabel?: string;
  experienceId?: string;
  id: string;
  locationLabel?: string;
  status: ReservationStatus;
  time?: string;
  timeLabel: string;
  title: string;
};

export const reservationsMock: ReservationItem[] = [
  {
    id: 'res-001',
    title: 'Spa & bem-estar',
    status: 'Confirmada',
    timeLabel: 'Hoje, 17:30',
    dateLabel: 'Hoje',
    time: '17:30',
    locationLabel: 'Spa do hotel',
  },
];
