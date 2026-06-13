export type StayInfoItem = {
  description: string;
  id: string;
  title: string;
};

export type StayMock = {
  checkInLabel: string;
  checkOutLabel: string;
  checkOutTimeLabel: string;
  features: {
    consumptionEnabled: boolean;
  };
  hotelName: string;
  roomNumber: string;
  statusLabel: string;
  summaries: {
    requests: string;
    reservations: string;
  };
  usefulInfo: StayInfoItem[];
  wifi?:
    | {
        network: string;
        password: string;
      }
    | null;
};

export const stayMock: StayMock = {
  hotelName: 'Copacabana Palace',
  roomNumber: '304',
  statusLabel: 'Hospedagem ativa',
  checkInLabel: '10 jun',
  checkOutLabel: '15 jun',
  checkOutTimeLabel: '12:00',
  wifi: {
    network: 'Copacabana Palace Guest',
    password: 'copacabana304',
  },
  summaries: {
    requests: '1 em andamento',
    reservations: '1 solicitada',
  },
  features: {
    consumptionEnabled: false,
  },
  usefulInfo: [
    {
      id: 'breakfast-hours',
      title: 'Horário do café',
      description: 'Servido das 6h30 às 10h30.',
    },
    {
      id: 'check-out',
      title: 'Check-out',
      description: 'Até 12:00.',
    },
    {
      id: 'visitor-policy',
      title: 'Política de visitantes',
      description: 'Consulte a recepção para orientações durante a estadia.',
    },
    {
      id: 'common-areas',
      title: 'Áreas comuns',
      description: 'Piscina, spa e restaurantes seguem horários informados pelo hotel.',
    },
    {
      id: 'front-desk',
      title: 'Contato da recepção',
      description: 'Disponível 24h pelo concierge.',
    },
  ],
};
