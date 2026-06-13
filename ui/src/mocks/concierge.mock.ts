import { guestMock } from '@/src/mocks/guest.mock';
import { stayMock } from '@/src/mocks/stay.mock';

export type ConciergeMessage = {
  id: string;
  sender: 'hotel' | 'guest';
  text: string;
  createdAtLabel?: string;
};

export const conciergeQuickSuggestions = [
  'Preciso de ajuda',
  'Quero uma recomendação',
  'Quero reservar algo',
  'Tenho uma solicitação',
  'Falar com a equipe',
] as const;

export type ConciergeQuickSuggestion = (typeof conciergeQuickSuggestions)[number];

export const conciergeQuickReplies: Record<ConciergeQuickSuggestion, string> = {
  'Preciso de ajuda':
    'Claro. Conte brevemente o que você precisa e a equipe do hotel irá orientar você.',
  'Quero uma recomendação':
    'Posso sugerir experiências, restaurantes ou momentos para relaxar durante a sua estadia. Você prefere algo para hoje?',
  'Quero reservar algo':
    'Perfeito. Você pode escolher uma experiência em Descobrir ou me dizer o que deseja reservar.',
  'Tenho uma solicitação':
    'Sem problema. Conte o que você precisa, ou acesse Serviços para fazer uma solicitação rápida ao hotel.',
  'Falar com a equipe':
    'Certo. Sua mensagem será encaminhada para a equipe do hotel. Escreva abaixo como podemos ajudar.',
};

export const defaultConciergeReply =
  'Recebemos sua mensagem. A equipe do hotel irá acompanhar e responder em breve.';

export function buildInitialConciergeMessages(
  guestName = guestMock.firstName,
  hotelName = stayMock.hotelName,
): ConciergeMessage[] {
  const trimmedGuestName = guestName.trim();
  const salutation = trimmedGuestName ? `Boa tarde, ${trimmedGuestName}.` : 'Boa tarde.';

  return [
    {
      id: 'welcome',
      sender: 'hotel',
      text: `${salutation} Sou o concierge do ${hotelName}. Posso ajudar com recomendações, reservas, solicitações ou qualquer detalhe da sua estadia.`,
      createdAtLabel: 'Agora',
    },
  ];
}
