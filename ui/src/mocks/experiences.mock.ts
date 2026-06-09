export type FeaturedExperience = {
  badge: string;
  category: string;
  description: string;
  id: string;
  imageSource?: number | string;
  priceLabel: string;
  timeLabel: string;
  title: string;
};

export const featuredExperienceMock: FeaturedExperience = {
  id: 'sunset-dinner',
  title: 'Jantar ao pôr do sol',
  description: 'Uma experiência à mesa para encerrar o dia com vista, cuidado e tranquilidade.',
  category: 'Gastronomia',
  timeLabel: 'Hoje, a partir das 19h',
  priceLabel: 'Sob consulta',
  badge: 'Selecionado para hoje',
  imageSource: require('../../assets/images/featured-sunset-dinner.png'),
};
