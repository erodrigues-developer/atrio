export type ReservationStatus =
  | 'Solicitada'
  | 'Confirmada'
  | 'Em andamento'
  | 'Concluída'
  | 'Cancelada';

export type ReservationItem = {
  dateLabel: string;
  experienceId: string;
  id: string;
  locationLabel: string;
  note?: string;
  status: ReservationStatus;
  timeLabel: string;
  title: string;
};

export const reservationsMock: ReservationItem[] = [
  {
    id: 'reservation-sunset-dinner',
    experienceId: 'sunset-dinner',
    title: 'Jantar ao pôr do sol',
    status: 'Solicitada',
    dateLabel: 'Hoje, 12 jun',
    timeLabel: '20:00',
    locationLabel: 'Restaurante do hotel',
    note: 'A equipe do hotel irá confirmar os detalhes.',
  },
  {
    id: 'reservation-spa',
    experienceId: 'spa-wellness',
    title: 'Spa & bem-estar',
    status: 'Confirmada',
    dateLabel: 'Amanhã, 13 jun',
    timeLabel: '17:30',
    locationLabel: 'Spa do hotel',
    note: 'Chegue alguns minutos antes do horário reservado.',
  },
  {
    id: 'reservation-beach-tour',
    experienceId: 'beach-tour',
    title: 'Tour pela orla',
    status: 'Em andamento',
    dateLabel: 'Hoje, 12 jun',
    timeLabel: '16:30',
    locationLabel: 'Saída pela recepção',
    note: 'A equipe acompanha a saída a partir da recepção.',
  },
  {
    id: 'reservation-breakfast-special',
    experienceId: 'breakfast-special',
    title: 'Café da manhã especial',
    status: 'Concluída',
    dateLabel: 'Ontem, 11 jun',
    timeLabel: '08:00',
    locationLabel: 'Salão de café',
    note: 'Experiência finalizada durante a manhã.',
  },
  {
    id: 'reservation-private-dinner',
    experienceId: 'private-dinner',
    title: 'Jantar privativo',
    status: 'Cancelada',
    dateLabel: 'Amanhã, 13 jun',
    timeLabel: '21:00',
    locationLabel: 'Ambiente privativo',
    note: 'Se desejar, o concierge pode ajudar com uma nova opção.',
  },
];
