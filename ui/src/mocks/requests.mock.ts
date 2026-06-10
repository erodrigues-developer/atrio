import type { ServiceType } from '@/src/mocks/services.mock';

export type RequestStatusType = 'received' | 'preparing' | 'on_the_way' | 'completed' | 'attention';

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
  statusType: RequestStatusType;
  timeLabel: string;
  title: string;
  type: ServiceType;
};

export function getRequestDetails(request: Pick<RequestItem, 'quantity' | 'roomNumber' | 'timeLabel'>) {
  const details: string[] = [];

  if (request.quantity) {
    details.push(`Quantidade: ${request.quantity}`);
  }

  details.push(`Quarto ${request.roomNumber}`);
  details.push(request.timeLabel);

  return details;
}

export const requestsMock: RequestItem[] = [
  {
    id: 'req-001',
    type: 'towels',
    title: 'Toalhas extras',
    status: 'A caminho',
    statusType: 'on_the_way',
    quantity: 2,
    note: '',
    roomNumber: '304',
    createdAt: 'Solicitado às 14:20',
    timeLabel: 'Solicitado às 14:20',
  },
];
