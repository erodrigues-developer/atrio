export const todayMock = {
  greetingPeriod: 'Boa tarde',
  message: 'Esperamos que sua estadia esteja sendo especial.',
  contextNote:
    'O fim de tarde é uma boa oportunidade para aproveitar uma experiência selecionada pelo hotel.',
} as const;

export const usefulInfoMock = [
  {
    id: 'wifi',
    title: 'Wi-Fi',
    description: 'Rede e senha da internet',
  },
  {
    id: 'breakfast',
    title: 'Horário do café',
    description: 'Disponível até 10:30',
  },
  {
    id: 'checkout',
    title: 'Check-out',
    description: 'Até 12:00',
  },
  {
    id: 'hotel-rules',
    title: 'Regras do hotel',
    description: 'Informações importantes da estadia',
  },
] as const;

export type UsefulInfoId = (typeof usefulInfoMock)[number]['id'];
