import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

const HOTEL_WEBSITE_URL = 'https://www.copacabanapalace.com';

const highlights = [
  {
    title: 'Gastronomia',
    description: 'Restaurantes premiados e experiências à mesa.',
  },
  {
    title: 'Spa & lazer',
    description: 'Momentos de descanso, piscina, bem-estar e cuidado.',
  },
  {
    title: 'Experiências',
    description: 'Passeios, atividades e sugestões selecionadas pelo hotel.',
  },
] as const;

export default function WelcomeScreen() {
  const handleOpenHotelWebsite = async () => {
    await WebBrowser.openBrowserAsync(HOTEL_WEBSITE_URL);
  };

  return (
    <Screen>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap={spacing.xxxl} paddingTop={72}>
          <YStack gap={spacing.xxl}>
            <YStack gap={spacing.lg}>
              <Image
                contentFit="contain"
                source={require('@/assets/images/logo-copacabana-removebg-preview.png')}
                style={{ alignSelf: 'center', height: 72, width: 72 }}
              />
              <Text alignSelf="center" letterSpacing={-0.5} maxWidth="92%" textAlign="center" variant="title1">
                Bem-vindo ao Copacabana Palace
              </Text>
              <Text colorToken="textSecondary" maxWidth="94%" variant="body">
                Uma experiência lendária no Rio de Janeiro, agora também no seu concierge digital.
              </Text>
            </YStack>

            <YStack gap={spacing.xl} maxWidth="92%">
              {highlights.map((highlight) => (
                <YStack
                  key={highlight.title}
                  borderBottomColor={colors.borderSoft}
                  borderBottomWidth={1}
                  gap={spacing.xs}
                  paddingBottom={spacing.lg}>
                  <Text variant="bodyMedium">{highlight.title}</Text>
                  <Text colorToken="textSecondary" variant="bodySmall">
                    {highlight.description}
                  </Text>
                </YStack>
              ))}
            </YStack>
          </YStack>
        </YStack>

        <YStack gap={spacing.md} paddingBottom={spacing.sm}>
          <Button onPress={() => router.push('/(onboarding)/identify-stay')}>
            <Text colorToken="textInverse" variant="bodyMedium">
              Acessar minha estadia
            </Text>
          </Button>
          <Text alignSelf="center" colorToken="textSecondary" variant="bodySmall">
            Ainda não tem uma reserva?
          </Text>
          <Button alignSelf="center" minHeight={44} onPress={handleOpenHotelWebsite} variant="ghost">
            <Text colorToken="accent" variant="bodySmall">
              Conhecer o hotel
            </Text>
          </Button>
        </YStack>
      </YStack>
    </Screen>
  );
}
