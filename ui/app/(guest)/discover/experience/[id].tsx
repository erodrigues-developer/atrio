import { router, useLocalSearchParams } from 'expo-router';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getExperienceById } from '@/src/mocks/experiences.mock';

export default function ExperienceDetailPlaceholderScreen() {
  const params = useLocalSearchParams<{
    collectionId?: string | string[];
    from?: string | string[];
    id?: string | string[];
  }>();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const collectionId = Array.isArray(params.collectionId) ? params.collectionId[0] : params.collectionId;
  const experience = getExperienceById(experienceId);
  const experienceTitle = experience?.title ?? 'Detalhe da experiência';

  function handleGoBack() {
    if (from === 'today') {
      router.replace('/(guest)/today');
      return;
    }

    if (from === 'collection' && collectionId) {
      router.replace(`/(guest)/discover/collection/${collectionId}`);
      return;
    }

    router.replace('/(guest)/discover');
  }

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} gap={spacing.xxxl}>
        <BackButton accessibilityLabel="Voltar" label="Voltar" onPress={handleGoBack} />

        <YStack gap={spacing.md}>
          <Text variant="title1">Detalhe da experiência</Text>
          <Text colorToken="textSecondary" maxWidth="92%" variant="body">
            Em breve você poderá conhecer os detalhes desta experiência.
          </Text>
        </YStack>

        <Card borderRadius={radius.xl} gap={spacing.lg}>
          <Text variant="bodyMedium">{experienceTitle}</Text>
          <Text colorToken="textSecondary" variant="body">
            {experience?.description ?? 'Esta experiência será apresentada com mais contexto em uma próxima etapa.'}
          </Text>
          <Text colorToken="textSecondary" variant="bodySmall">
            {[experience?.timeLabel, experience?.priceLabel].filter(Boolean).join(' · ') || 'Mais informações em breve'}
          </Text>
        </Card>
      </YStack>
    </Screen>
  );
}
