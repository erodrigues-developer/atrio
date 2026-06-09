export const servicesMock = [
  {
    id: 'towels',
    title: 'Toalhas',
    description: 'Solicite toalhas extras para o quarto.',
    icon: 'Bath',
  },
  {
    id: 'cleaning',
    title: 'Limpeza',
    description: 'Peça arrumação ou limpeza adicional.',
    icon: 'Sparkles',
  },
  {
    id: 'amenities',
    title: 'Amenities',
    description: 'Itens de conforto para a sua estadia.',
    icon: 'Package',
  },
  {
    id: 'maintenance',
    title: 'Manutenção',
    description: 'Informe algo que precise de atenção no quarto.',
    icon: 'Wrench',
  },
  {
    id: 'laundry',
    title: 'Lavanderia',
    description: 'Solicite coleta ou informações sobre lavanderia.',
    icon: 'Shirt',
  },
  {
    id: 'luggage',
    title: 'Bagagem',
    description: 'Peça apoio com malas ou volumes.',
    icon: 'Luggage',
  },
  {
    id: 'room-service',
    title: 'Room service',
    description: 'Peça alimentos e bebidas no quarto.',
    icon: 'Utensils',
  },
  {
    id: 'special',
    title: 'Solicitações especiais',
    description: 'Conte ao hotel o que você precisa.',
    icon: 'MessageSquareText',
  },
] as const;

export type ServiceType = (typeof servicesMock)[number]['id'];
export type ServiceIconId = (typeof servicesMock)[number]['icon'];
