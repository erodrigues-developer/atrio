import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { FeaturedExperienceCard } from '@/src/design-system/product/FeaturedExperienceCard';
import { HorizontalExperienceList } from '@/src/design-system/product/HorizontalExperienceList';
import { spacing } from '@/src/design-system/tokens/spacing';
import {
  discoverCollectionsMock,
  discoverEditorialCollectionsMock,
} from '@/src/mocks/experiences.mock';

export default function DiscoverScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const featuredCollection = discoverCollectionsMock.find((collection) => collection.featured);

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
          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.5} variant="title1">
              Descobrir
            </Text>
            <Text colorToken="textSecondary" maxWidth="94%" variant="body">
              Experiências selecionadas pelo hotel para tornar sua estadia especial.
            </Text>
          </YStack>

          {featuredCollection?.items[0] ? (
            <YStack gap={spacing.md}>
              <SectionHeader
                description={featuredCollection.description}
                title={featuredCollection.title}
              />
              <FeaturedExperienceCard
                badge={featuredCollection.items[0].badge}
                description={featuredCollection.items[0].description}
                imageSource={featuredCollection.items[0].imageSource}
                onPress={() =>
                  router.push({
                    pathname: '/(guest)/discover/experience/[id]',
                    params: {
                      id: featuredCollection.items[0].id,
                      returnTo: '/(guest)/discover',
                    },
                  } as Href)
                }
                priceLabel={featuredCollection.items[0].priceLabel}
                timeLabel={featuredCollection.items[0].timeLabel}
                title={featuredCollection.items[0].title}
              />
            </YStack>
          ) : null}

          {discoverEditorialCollectionsMock.map((collection) => (
            <YStack gap={spacing.md} key={collection.id}>
              <SectionHeader
                actionLabel="Ver tudo"
                onPressAction={() => router.push(`/(guest)/discover/collection/${collection.id}` as Href)}
                title={collection.title}
              />
              <HorizontalExperienceList
                items={collection.items}
                onPressItem={(item) =>
                  router.push({
                    pathname: '/(guest)/discover/experience/[id]',
                    params: {
                      id: item.id,
                      returnTo: '/(guest)/discover',
                    },
                  } as Href)
                }
              />
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
