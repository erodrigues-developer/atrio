export type ExperienceItem = {
  badge?: string;
  category: string;
  description: string;
  id: string;
  imageSource?: number | string;
  priceLabel: string;
  timeLabel: string;
  title: string;
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
const sunsetDinnerImage = require('../../assets/mock/hospitality/jantar-ao-por-do-sol.png');
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
        description: 'Uma experiência à mesa para encerrar o dia com vista, cuidado e tranquilidade.',
        category: 'Gastronomia',
        timeLabel: 'Hoje, a partir das 19h',
        priceLabel: 'Sob consulta',
        badge: 'Selecionado para hoje',
        imageSource: sunsetDinnerImage,
      },
    ],
  },
  {
    id: 'relax',
    title: 'Para relaxar',
    items: [
      {
        id: 'spa-wellness',
        title: 'Spa & bem-estar',
        description: 'Uma pausa para desacelerar com cuidado e tranquilidade.',
        category: 'Spa',
        timeLabel: 'Hoje, 17:30',
        priceLabel: 'Sob consulta',
        imageSource: spaImage,
      },
      {
        id: 'relaxing-massage',
        title: 'Massagem relaxante',
        description: 'Um momento de descanso preparado pela equipe do spa.',
        category: 'Bem-estar',
        timeLabel: 'Horários disponíveis',
        priceLabel: 'Sob consulta',
        imageSource: massageImage,
      },
    ],
  },
  {
    id: 'gastronomy',
    title: 'Gastronomia',
    items: [
      {
        id: 'special-breakfast',
        title: 'Café da manhã especial',
        description: 'Comece o dia com uma seleção preparada pelo hotel.',
        category: 'Gastronomia',
        timeLabel: 'Amanhã, a partir das 7h',
        priceLabel: 'Sob consulta',
        imageSource: specialBreakfastImage,
      },
      {
        id: 'sea-view-dinner',
        title: 'Jantar com vista',
        description: 'Uma mesa preparada para aproveitar a noite com calma.',
        category: 'Restaurante',
        timeLabel: 'Hoje, 20:00',
        priceLabel: 'Sob consulta',
        imageSource: dinnerWithViewImage,
      },
    ],
  },
  {
    id: 'romantic',
    title: 'Experiências românticas',
    items: [
      {
        id: 'special-night',
        title: 'Noite especial',
        description: 'Uma sugestão reservada para celebrar com calma e discrição.',
        category: 'Experiência a dois',
        timeLabel: 'Sob agendamento',
        priceLabel: 'Sob consulta',
        imageSource: specialNightImage,
      },
      {
        id: 'private-dinner',
        title: 'Jantar privativo',
        description: 'Um momento à mesa preparado para duas pessoas.',
        category: 'Gastronomia',
        timeLabel: 'Hoje, 21:00',
        priceLabel: 'Sob consulta',
        imageSource: privateDinnerImage,
      },
    ],
  },
  {
    id: 'family',
    title: 'Para famílias',
    items: [
      {
        id: 'family-pool',
        title: 'Piscina em família',
        description: 'Um momento leve para aproveitar o dia juntos.',
        category: 'Lazer',
        timeLabel: 'Hoje, durante a tarde',
        priceLabel: 'Incluído na estadia',
        imageSource: familyPoolImage,
      },
      {
        id: 'kids-activities',
        title: 'Atividades infantis',
        description: 'Sugestões para tornar a estadia mais divertida para os pequenos.',
        category: 'Família',
        timeLabel: 'Programação do dia',
        priceLabel: 'Sob consulta',
        imageSource: kidsActivitiesImage,
      },
    ],
  },
  {
    id: 'tours',
    title: 'Passeios',
    items: [
      {
        id: 'rio-at-dusk',
        title: 'Rio ao entardecer',
        description: 'Uma experiência para apreciar a cidade em um horário especial.',
        category: 'Passeio',
        timeLabel: 'Hoje, 16:30',
        priceLabel: 'Sob consulta',
        imageSource: rioAtDuskImage,
      },
      {
        id: 'boardwalk-tour',
        title: 'Tour pela orla',
        description: 'Um passeio leve para conhecer os arredores com tranquilidade.',
        category: 'Cidade',
        timeLabel: 'Saídas pela manhã',
        priceLabel: 'Sob consulta',
        imageSource: boardwalkTourImage,
      },
    ],
  },
  {
    id: 'most-booked',
    title: 'Mais reservadas',
    items: [
      {
        id: 'most-booked-spa',
        title: 'Spa & bem-estar',
        description: 'Uma das experiências mais procuradas pelos hóspedes.',
        category: 'Spa',
        timeLabel: 'Hoje, 17:30',
        priceLabel: 'Sob consulta',
        imageSource: spaImage,
      },
      {
        id: 'most-booked-sunset',
        title: 'Jantar ao pôr do sol',
        description: 'Uma escolha especial para encerrar o dia.',
        category: 'Gastronomia',
        timeLabel: 'Hoje, a partir das 19h',
        priceLabel: 'Sob consulta',
        imageSource: sunsetDinnerImage,
      },
    ],
  },
];

export const featuredExperienceMock: ExperienceItem = discoverCollectionsMock[0].items[0];

export function getExperienceById(experienceId?: string) {
  if (!experienceId) {
    return undefined;
  }

  return discoverCollectionsMock
    .flatMap((collection) => collection.items)
    .find((item) => item.id === experienceId);
}
