import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { CollectionExperienceCard } from '@/src/design-system/product/CollectionExperienceCard';
import { goBackOrReplace } from '@/src/navigation/go-back';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getDiscoverCollectionById } from '@/src/mocks/experiences.mock';

export default function DiscoverCollectionScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const collectionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const collection = getDiscoverCollectionById(collectionId);

  function handleGoBack() {
    goBackOrReplace('/(guest)/discover');
  }

  const content = !collection ? (
    <Card gap={spacing.lg}>
      <Button alignSelf="flex-start" onPress={() => router.replace('/(guest)/discover')}>
        Voltar para Experiências
      </Button>
    </Card>
  ) : collection.items.length === 0 ? (
    <Card gap={spacing.lg}>
      <YStack gap={spacing.xs}>
        <Text variant="bodyMedium">Nenhuma experiência disponível nesta seleção no momento.</Text>
        <Text colorToken="textSecondary" variant="bodySmall">
          Você pode voltar para Experiências ou falar com o concierge para receber uma sugestão.
        </Text>
      </YStack>

      <YStack gap={spacing.md}>
        <Button alignSelf="flex-start" onPress={() => router.replace('/(guest)/discover')}>
          Voltar para Experiências
        </Button>

        <Button alignSelf="flex-start" onPress={() => router.push('/(guest)/concierge')} variant="ghost">
          <Text colorToken="accent" variant="bodyMedium">
            Falar com o concierge
          </Text>
        </Button>
      </YStack>
    </Card>
  ) : (
    <YStack gap={spacing.lg}>
      {collection.items.map((item) => (
        <CollectionExperienceCard
          badge={item.badge}
          description={item.description}
          imageSource={item.imageSource}
          key={item.id}
          onPress={() =>
            router.push({
              pathname: '/(guest)/discover/experience/[id]',
              params: {
                id: item.id,
                returnTo: `/(guest)/discover/collection/${collection.id}`,
              },
            } as Href)
          }
          priceLabel={item.priceLabel}
          timeLabel={item.timeLabel}
          title={item.title}
        />
      ))}
    </YStack>
  );

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxxl}>
          <BackButton accessibilityLabel="Voltar" label="Voltar" onPress={handleGoBack} />

          <YStack gap={spacing.md}>
            <Text letterSpacing={-0.5} variant="title1">
              {collection?.title ?? 'Coleção não encontrada'}
            </Text>
            <Text colorToken="textSecondary" maxWidth="94%" variant="body">
              {collection?.description ?? 'Não conseguimos encontrar esta seleção no momento.'}
            </Text>
          </YStack>

          {content}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
