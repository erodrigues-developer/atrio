export type ExperienceItem = {
  availabilityLabel?: string;
  badge?: string;
  category: string;
  description: string;
  durationLabel?: string;
  id: string;
  imageSource?: number | string;
  included?: string[];
  locationDescription?: string;
  locationLabel?: string;
  policy?: string;
  priceLabel: string;
  timeLabel: string;
  title: string;
};

export type ExperienceScheduleSlot = {
  available: boolean;
  id: string;
  time: string;
};

export type ExperienceScheduleDay = {
  dateLabel: string;
  id: string;
  label: string;
  slots: ExperienceScheduleSlot[];
};

export type ExperienceSchedule = {
  days: ExperienceScheduleDay[];
};

export type DiscoverCollection = {
  description?: string;
  featured?: boolean;
  id: string;
  items: ExperienceItem[];
  title: string;
};

const spaImage = require('../../assets/mock/hospitality/spa.png');
const massageImage = require('../../assets/mock/hospitality/massagem.png');
const specialBreakfastImage = require('../../assets/mock/hospitality/cafe-especial.png');
const sunsetDinnerImage = require('../../assets/mock/hospitality/sunset-dinner.webp');
const dinnerWithViewImage = require('../../assets/mock/hospitality/jantar-com-vista.png');
const specialNightImage = require('../../assets/mock/hospitality/noite-especial.png');
const privateDinnerImage = require('../../assets/mock/hospitality/jantar-privativo.png');
const familyPoolImage = require('../../assets/mock/hospitality/piscina-em-familia.png');
const kidsActivitiesImage = require('../../assets/mock/hospitality/atividades-infantis.png');
const rioAtDuskImage = require('../../assets/mock/hospitality/rio-ao-entardecer.png');
const boardwalkTourImage = require('../../assets/mock/hospitality/tour-pela-orla.png');

export const discoverCollectionsMock: DiscoverCollection[] = [
  {
    id: 'today',
    title: 'Selecionado para hoje',
    description: 'Uma sugestão especial para aproveitar este momento da estadia.',
    featured: true,
    items: [
      {
        id: 'sunset-dinner',
        title: 'Jantar ao pôr do sol',
        description:
          'Uma experiência à mesa para encerrar o dia com vista, cuidado e tranquilidade. Ideal para aproveitar o fim de tarde com uma seleção preparada pelo hotel.',
        category: 'Gastronomia',
        timeLabel: 'Hoje, a partir das 19h',
        priceLabel: 'Sob consulta',
        badge: 'Selecionado para hoje',
        imageSource: sunsetDinnerImage,
        durationLabel: '2h',
        availabilityLabel: 'Hoje, a partir das 19h',
        locationLabel: 'Restaurante do hotel',
        included: [
          'Mesa preparada para a experiência',
          'Atendimento do hotel',
          'Seleção gastronômica definida conforme disponibilidade',
          'Orientação da equipe sobre horários',
        ],
        locationDescription:
          'Restaurante do hotel, com orientação da equipe no momento da confirmação.',
        policy:
          'A confirmação está sujeita à disponibilidade de horário. Caso seja necessário ajustar algum detalhe, a equipe do hotel entrará em contato.',
      },
    ],
  },
  {
    id: 'relax',
    title: 'Para relaxar',
    description: 'Experiências selecionadas para desacelerar durante a estadia.',
    items: [
      {
        id: 'spa-wellness',
        title: 'Spa & bem-estar',
        description: 'Uma pausa para desacelerar com cuidado e tranquilidade.',
        category: 'Spa',
        timeLabel: '60 min',
        priceLabel: 'Sob consulta',
        badge: 'Disponível hoje',
        imageSource: spaImage,
        durationLabel: '90 min',
        availabilityLabel: 'Hoje, com horários ao longo do dia',
        locationLabel: 'Spa do hotel',
        included: [
          'Recepção da equipe de bem-estar',
          'Acesso ao ambiente preparado para a experiência',
          'Orientação sobre horários e chegada',
        ],
        locationDescription: 'Spa do hotel, com recepção dedicada na área de bem-estar.',
        policy:
          'Os horários podem ser ajustados conforme disponibilidade do spa no momento da confirmação.',
      },
      {
        id: 'relaxing-massage',
        title: 'Massagem relaxante',
        description: 'Um momento de descanso preparado pela equipe do spa.',
        category: 'Bem-estar',
        timeLabel: '50 min',
        priceLabel: 'Sob consulta',
        badge: 'Sob agendamento',
        imageSource: massageImage,
        durationLabel: '50 min',
        availabilityLabel: 'Sob agendamento',
        locationLabel: 'Spa do hotel',
        included: [
          'Atendimento da equipe do spa',
          'Sala preparada para a sessão',
          'Orientação sobre chegada e duração',
        ],
        locationDescription: 'Spa do hotel, com indicação da sala no momento da confirmação.',
        policy:
          'A confirmação depende da disponibilidade de agenda da equipe de bem-estar.',
      },
    ],
  },
  {
    id: 'gastronomy',
    title: 'Gastronomia',
    description: 'Sugestões à mesa para aproveitar sabores e momentos especiais.',
    items: [
      {
        id: 'breakfast-special',
        title: 'Café da manhã especial',
        description: 'Comece o dia com uma seleção preparada pelo hotel.',
        category: 'Gastronomia',
        timeLabel: 'Amanhã, a partir das 7h',
        priceLabel: 'Sob consulta',
        badge: 'Selecionado pelo hotel',
        imageSource: specialBreakfastImage,
        durationLabel: '1h30',
        availabilityLabel: 'Amanhã, a partir das 7h',
        locationLabel: 'Salão de café',
        included: [
          'Mesa preparada para a experiência',
          'Seleção matinal conforme disponibilidade',
          'Acompanhamento da equipe do restaurante',
        ],
        locationDescription: 'Salão de café do hotel, com orientação da equipe no momento da confirmação.',
        policy:
          'Os horários estão sujeitos à ocupação do restaurante e podem ser confirmados pela equipe.',
      },
      {
        id: 'sea-view-dinner',
        title: 'Jantar com vista',
        description: 'Uma mesa preparada para aproveitar a noite com calma.',
        category: 'Restaurante',
        timeLabel: 'Hoje, 20:00',
        priceLabel: 'Sob consulta',
        badge: 'Disponível hoje',
        imageSource: dinnerWithViewImage,
        durationLabel: '2h',
        availabilityLabel: 'Hoje, 20:00',
        locationLabel: 'Área reservada do restaurante',
        included: [
          'Mesa preparada para a noite',
          'Atendimento do restaurante',
          'Orientação da equipe sobre o melhor horário de chegada',
        ],
        locationDescription:
          'Área reservada do restaurante, definida de acordo com a melhor condição do dia.',
        policy:
          'A confirmação depende da disponibilidade da área reservada e pode ser ajustada pela equipe.',
      },
    ],
  },
  {
    id: 'romantic',
    title: 'Experiências românticas',
    description: 'Momentos preparados para celebrar com calma e discrição.',
    items: [
      {
        id: 'romantic-night',
        title: 'Noite especial',
        description: 'Uma sugestão reservada para celebrar com calma e discrição.',
        category: 'Experiência a dois',
        timeLabel: 'Sob agendamento',
        priceLabel: 'Sob consulta',
        badge: 'Exclusivo do hotel',
        imageSource: specialNightImage,
        durationLabel: 'Conforme programação',
        availabilityLabel: 'Sob agendamento',
        locationLabel: 'Área reservada do hotel',
        included: [
          'Ambientação preparada para a ocasião',
          'Acompanhamento da equipe do hotel',
          'Definição do melhor horário conforme disponibilidade',
        ],
        locationDescription:
          'A experiência acontece em uma área reservada do hotel, definida na confirmação.',
        policy:
          'A equipe do hotel confirma o formato e o horário conforme disponibilidade da operação.',
      },
      {
        id: 'private-dinner',
        title: 'Jantar privativo',
        description: 'Um momento à mesa preparado para duas pessoas.',
        category: 'Gastronomia',
        timeLabel: 'Hoje, 21:00',
        priceLabel: 'Sob consulta',
        badge: 'Selecionado pelo hotel',
        imageSource: privateDinnerImage,
        durationLabel: '2h',
        availabilityLabel: 'Hoje, 21:00',
        locationLabel: 'Ambiente privativo',
        included: [
          'Mesa preparada para duas pessoas',
          'Atendimento do hotel',
          'Orientação da equipe sobre chegada e confirmação',
        ],
        locationDescription: 'Ambiente privativo do hotel, indicado pela equipe no momento da confirmação.',
        policy:
          'A experiência depende da disponibilidade do espaço reservado e do horário escolhido.',
      },
    ],
  },
  {
    id: 'families',
    title: 'Para famílias',
    description: 'Atividades e sugestões para aproveitar melhor a estadia juntos.',
    items: [
      {
        id: 'family-pool',
        title: 'Piscina em família',
        description: 'Um momento leve para aproveitar o dia juntos.',
        category: 'Lazer',
        timeLabel: 'Hoje, durante a tarde',
        priceLabel: 'Incluído na estadia',
        badge: 'Disponível hoje',
        imageSource: familyPoolImage,
        durationLabel: 'Livre durante a tarde',
        availabilityLabel: 'Hoje, durante a tarde',
        locationLabel: 'Piscina principal',
        included: [
          'Acesso à área da piscina',
          'Apoio da equipe de lazer',
          'Orientação sobre funcionamento no dia',
        ],
        locationDescription: 'Piscina principal do hotel, com orientação da equipe de lazer ao chegar.',
        policy:
          'A programação pode variar de acordo com o clima e com a operação do hotel no dia.',
      },
      {
        id: 'kids-activities',
        title: 'Atividades infantis',
        description: 'Sugestões para tornar a estadia mais divertida para os pequenos.',
        category: 'Família',
        timeLabel: 'Programação do dia',
        priceLabel: 'Sob consulta',
        badge: 'Selecionado pelo hotel',
        imageSource: kidsActivitiesImage,
        durationLabel: 'Conforme programação',
        availabilityLabel: 'Programação do dia',
        locationLabel: 'Espaço infantil',
        included: [
          'Atividades acompanhadas pela equipe',
          'Orientação sobre horários do dia',
          'Indicação do ponto de encontro',
        ],
        locationDescription: 'Espaço infantil do hotel, com confirmação da programação no próprio dia.',
        policy:
          'As atividades podem mudar conforme faixa etária, clima e programação definida pela equipe.',
      },
    ],
  },
  {
    id: 'tours',
    title: 'Passeios',
    description: 'Experiências para conhecer a cidade com leveza e tranquilidade.',
    items: [
      {
        id: 'rio-sunset',
        title: 'Rio ao entardecer',
        description: 'Uma experiência para apreciar a cidade em um horário especial.',
        category: 'Passeio',
        timeLabel: 'Hoje, 16:30',
        priceLabel: 'Sob consulta',
        imageSource: rioAtDuskImage,
        durationLabel: '2h30',
        availabilityLabel: 'Hoje, 16:30',
        locationLabel: 'Saída pela recepção',
        included: [
          'Orientação da equipe sobre o passeio',
          'Ponto de encontro definido pelo hotel',
          'Confirmação do melhor horário no dia',
        ],
        locationDescription: 'A saída acontece com orientação da equipe a partir da recepção do hotel.',
        policy:
          'A realização depende das condições do dia e da disponibilidade de horário para saída.',
      },
      {
        id: 'beach-tour',
        title: 'Tour pela orla',
        description: 'Um passeio leve para conhecer os arredores com tranquilidade.',
        category: 'Cidade',
        timeLabel: 'Saídas pela manhã',
        priceLabel: 'Sob consulta',
        badge: 'Sob agendamento',
        imageSource: boardwalkTourImage,
        durationLabel: '2h',
        availabilityLabel: 'Saídas pela manhã',
        locationLabel: 'Saída pela recepção',
        included: [
          'Orientação inicial da equipe',
          'Definição do ponto de encontro',
          'Acompanhamento das informações de saída',
        ],
        locationDescription: 'A equipe orienta o ponto de partida e os detalhes do passeio na confirmação.',
        policy:
          'A confirmação depende da disponibilidade de agenda e das condições ideais para o passeio.',
      },
    ],
  },
  {
    id: 'most-booked',
    title: 'Mais reservadas',
    description: 'As experiências mais procuradas pelos hóspedes.',
    items: [
      {
        id: 'most-booked-spa',
        title: 'Spa & bem-estar',
        description: 'Uma das experiências mais procuradas pelos hóspedes.',
        category: 'Spa',
        timeLabel: 'Hoje, 17:30',
        priceLabel: 'Sob consulta',
        badge: 'Mais reservada',
        imageSource: spaImage,
        durationLabel: '90 min',
        availabilityLabel: 'Hoje, 17:30',
        locationLabel: 'Spa do hotel',
        included: [
          'Recepção da equipe de bem-estar',
          'Acesso ao ambiente preparado para a experiência',
          'Orientação sobre horários e chegada',
        ],
        locationDescription: 'Spa do hotel, com recepção dedicada na área de bem-estar.',
        policy:
          'Os horários podem ser ajustados conforme disponibilidade do spa no momento da confirmação.',
      },
      {
        id: 'most-booked-sunset',
        title: 'Jantar ao pôr do sol',
        description: 'Uma escolha especial para encerrar o dia.',
        category: 'Gastronomia',
        timeLabel: 'Hoje, a partir das 19h',
        priceLabel: 'Sob consulta',
        badge: 'Mais reservada',
        imageSource: sunsetDinnerImage,
        durationLabel: '2h',
        availabilityLabel: 'Hoje, a partir das 19h',
        locationLabel: 'Restaurante do hotel',
        included: [
          'Mesa preparada para a experiência',
          'Atendimento do hotel',
          'Orientação da equipe sobre horários',
        ],
        locationDescription:
          'Restaurante do hotel, com orientação da equipe no momento da confirmação.',
        policy:
          'A confirmação está sujeita à disponibilidade de horário. Caso seja necessário ajustar algum detalhe, a equipe do hotel entrará em contato.',
      },
    ],
  },
];

export const featuredExperienceMock: ExperienceItem = discoverCollectionsMock[0].items[0];
export const discoverEditorialCollectionsMock = discoverCollectionsMock.filter(
  (collection) => !collection.featured,
);

export const experienceScheduleMock: Record<string, ExperienceSchedule> = {
  'sunset-dinner': {
    days: [
      {
        id: 'today',
        label: 'Hoje',
        dateLabel: '12 jun',
        slots: [
          { id: '1830', time: '18:30', available: true },
          { id: '1900', time: '19:00', available: true },
          { id: '1930', time: '19:30', available: true },
          { id: '2000', time: '20:00', available: true },
          { id: '2030', time: '20:30', available: false },
        ],
      },
      {
        id: 'tomorrow',
        label: 'Amanhã',
        dateLabel: '13 jun',
        slots: [
          { id: '1900', time: '19:00', available: true },
          { id: '1930', time: '19:30', available: true },
          { id: '2000', time: '20:00', available: true },
        ],
      },
      {
        id: 'fri-14',
        label: 'Sex',
        dateLabel: '14 jun',
        slots: [
          { id: '1900', time: '19:00', available: true },
          { id: '1930', time: '19:30', available: true },
          { id: '2030', time: '20:30', available: true },
        ],
      },
      {
        id: 'sat-15',
        label: 'Sáb',
        dateLabel: '15 jun',
        slots: [
          { id: '1830', time: '18:30', available: false },
          { id: '1900', time: '19:00', available: false },
        ],
      },
      {
        id: 'sun-16',
        label: 'Dom',
        dateLabel: '16 jun',
        slots: [
          { id: '1930', time: '19:30', available: true },
          { id: '2000', time: '20:00', available: true },
        ],
      },
    ],
  },
};

export function getDiscoverCollectionById(collectionId?: string) {
  if (!collectionId) {
    return undefined;
  }

  return discoverEditorialCollectionsMock.find((collection) => collection.id === collectionId);
}

export function getExperienceById(experienceId?: string) {
  if (!experienceId) {
    return undefined;
  }

  return discoverCollectionsMock
    .flatMap((collection) => collection.items)
    .find((item) => item.id === experienceId);
}

export function getExperienceScheduleById(experienceId?: string) {
  if (!experienceId) {
    return undefined;
  }

  return experienceScheduleMock[experienceId];
}
