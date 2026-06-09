export type ReservationStatus = 'Confirmada' | 'Pendente' | 'Precisa de atenção';

export type ReservationItem = {
  id: string;
  status: ReservationStatus;
  timeLabel: string;
  title: string;
};

export const reservationsMock: ReservationItem[] = [
  {
    id: 'res-001',
    title: 'Spa & bem-estar',
    status: 'Confirmada',
    timeLabel: 'Hoje, 17:30',
  },
];
