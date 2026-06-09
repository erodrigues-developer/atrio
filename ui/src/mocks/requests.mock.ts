import type { ServiceType } from '@/src/mocks/services.mock';

export type RequestStatus =
  | 'Recebido'
  | 'Em preparo'
  | 'A caminho'
  | 'Concluído'
  | 'Precisa de atenção';

export type RequestItem = {
  createdAt: string;
  id: string;
  note: string;
  quantity?: number;
  roomNumber: string;
  status: RequestStatus;
  timeLabel: string;
  title: string;
  type: ServiceType;
};

export const requestsMock: RequestItem[] = [
  {
    id: 'req-001',
    type: 'towels',
    title: 'Toalhas extras',
    status: 'A caminho',
    quantity: 2,
    note: '',
    roomNumber: '304',
    createdAt: 'Solicitado às 14:20',
    timeLabel: 'Solicitado às 14:20',
  },
];
