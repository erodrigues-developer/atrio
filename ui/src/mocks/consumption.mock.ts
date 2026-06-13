export type ConsumptionItemMock = {
  amount: number;
  amountLabel: string;
  dateLabel: string;
  description: string;
  icon: 'utensils' | 'sparkles' | 'shirt';
  id: string;
  title: string;
};

export type ConsumptionMock = {
  emptyState: {
    description: string;
    title: string;
  };
  enabled: boolean;
  totalAmount: number;
  totalLabel: string;
  updatedAtLabel: string;
  unavailableState: {
    actionLabel: string;
    description: string;
    title: string;
  };
  view: 'ready' | 'empty' | 'unavailable';
  items: ConsumptionItemMock[];
};

const isConsumptionEnabled = true;

export const consumptionFallbackMock: ConsumptionMock = {
  enabled: false,
  view: 'unavailable',
  totalAmount: 0,
  totalLabel: 'R$ 0,00',
  updatedAtLabel: '',
  items: [],
  emptyState: {
    title: 'Nenhum consumo registrado.',
    description: 'Quando houver lançamentos vinculados à sua hospedagem, eles aparecerão aqui.',
  },
  unavailableState: {
    title: 'Consumo indisponível no momento.',
    description:
      'Não foi possível carregar os lançamentos da estadia. Para informações atualizadas, fale com a recepção ou com o concierge.',
    actionLabel: 'Falar com o concierge',
  },
};

export const consumptionMock: ConsumptionMock = {
  enabled: isConsumptionEnabled,
  view: 'ready',
  totalAmount: 342,
  totalLabel: 'R$ 342,00',
  updatedAtLabel: 'Atualizado hoje às 15:40',
  items: [
    {
      id: 'room-service-001',
      title: 'Room service',
      description: 'Pedido no quarto',
      dateLabel: 'Hoje, 14:20',
      amountLabel: 'R$ 128,00',
      amount: 128,
      icon: 'utensils',
    },
    {
      id: 'spa-001',
      title: 'Spa & bem-estar',
      description: 'Massagem relaxante',
      dateLabel: 'Hoje, 17:30',
      amountLabel: 'R$ 180,00',
      amount: 180,
      icon: 'sparkles',
    },
    {
      id: 'laundry-001',
      title: 'Lavanderia',
      description: 'Serviço de lavanderia',
      dateLabel: 'Ontem, 18:10',
      amountLabel: 'R$ 34,00',
      amount: 34,
      icon: 'shirt',
    },
  ],
  emptyState: consumptionFallbackMock.emptyState,
  unavailableState: consumptionFallbackMock.unavailableState,
};

export function getConsumptionMock(): ConsumptionMock {
  return consumptionMock ?? consumptionFallbackMock;
}
