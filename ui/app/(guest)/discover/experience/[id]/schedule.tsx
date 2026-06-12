import { router, useLocalSearchParams, type Href } from 'expo-router';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getExperienceById } from '@/src/mocks/experiences.mock';

export default function ExperienceSchedulePlaceholderScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const experience = getExperienceById(experienceId);

  function handleGoBack() {
    if (!experienceId) {
      router.replace('/(guest)/discover');
      return;
    }

    router.replace({
      pathname: '/(guest)/discover/experience/[id]',
      params: {
        id: experienceId,
      },
    } as Href);
  }

  if (!experience) {
    return (
      <Screen justifyContent="center" safeAreaEdges={['bottom']}>
        <YStack gap={spacing.xxxl}>
          <YStack gap={spacing.md}>
            <Text variant="title1">Experiência não encontrada</Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              Não conseguimos encontrar os detalhes desta experiência no momento.
            </Text>
          </YStack>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} gap={spacing.xxxl}>
        <BackButton accessibilityLabel="Voltar para a experiência" label="Voltar" onPress={handleGoBack} />

        <YStack gap={spacing.md}>
          <Text variant="title1">Selecionar horário</Text>
          <Text colorToken="textSecondary" maxWidth="92%" variant="body">
            Em breve você poderá escolher um horário para esta experiência.
          </Text>
        </YStack>

        <Card gap={spacing.md}>
          <Text variant="bodyMedium">{experience.title}</Text>
          <Text colorToken="textSecondary" variant="body">
            {experience.availabilityLabel ?? experience.timeLabel}
          </Text>
        </Card>
      </YStack>
    </Screen>
  );
}
