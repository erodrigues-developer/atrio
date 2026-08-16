const experienceImageById: Record<string, number> = {
  'spa-wellness': require('@/assets/mock/hospitality/spa.png'),
  'relaxing-massage': require('@/assets/mock/hospitality/massagem.png'),
  'breakfast-special': require('@/assets/mock/hospitality/cafe-especial.png'),
  'sunset-dinner': require('@/assets/mock/hospitality/sunset-dinner.webp'),
  'sea-view-dinner': require('@/assets/mock/hospitality/jantar-com-vista.png'),
  'romantic-night': require('@/assets/mock/hospitality/noite-especial.png'),
  'private-dinner': require('@/assets/mock/hospitality/jantar-privativo.png'),
  'family-pool': require('@/assets/mock/hospitality/piscina-em-familia.png'),
  'kids-activities': require('@/assets/mock/hospitality/atividades-infantis.png'),
  'rio-sunset': require('@/assets/mock/hospitality/rio-ao-entardecer.png'),
  'beach-tour': require('@/assets/mock/hospitality/tour-pela-orla.png'),
};

export function resolveExperienceImageSource(experienceId: string, imageUrl?: string | null) {
  return experienceImageById[experienceId] ?? imageUrl ?? undefined;
}
