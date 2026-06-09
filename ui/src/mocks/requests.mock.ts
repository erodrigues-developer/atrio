export type RequestStatus =
  | 'Recebido'
  | 'Em preparo'
  | 'A caminho'
  | 'Concluído'
  | 'Precisa de atenção';

export type RequestItem = {
  id: string;
  status: RequestStatus;
  timeLabel: string;
  title: string;
};

export const requestsMock: RequestItem[] = [
  {
    id: 'req-001',
    title: 'Toalhas extras',
    status: 'A caminho',
    timeLabel: 'Solicitado às 14:20',
  },
];
