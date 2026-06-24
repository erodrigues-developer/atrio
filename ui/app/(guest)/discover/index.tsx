import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { FeaturedExperienceCard } from '@/src/design-system/product/FeaturedExperienceCard';
import { HorizontalExperienceList } from '@/src/design-system/product/HorizontalExperienceList';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import {
  listExperienceCollections,
  type ExperienceCollectionResponse,
} from '@/src/services/atrio-api';
import { resolveExperienceImageSource } from '@/src/services/experience-image';

function mapExperienceItem(item: ExperienceCollectionResponse['items'][number]) {
  return {
    ...item,
    badge: item.badge ?? undefined,
    imageSource: resolveExperienceImageSource(item.id, item.imageUrl),
  };
}

export default function DiscoverScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [collections, setCollections] = useState<ExperienceCollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    listExperienceCollections()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setCollections(response.collections);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Nao foi possivel carregar as experiencias.',
        );
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredCollection = collections.find((collection) => collection.featured);
  const editorialCollections = collections.filter((collection) => !collection.featured);

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

          {isLoading ? (
            <YStack alignItems="center" gap={spacing.lg} paddingVertical={spacing.huge}>
              <ActivityIndicator color={colors.accent} />
              <Text colorToken="textSecondary" variant="body">
                Carregando experiências...
              </Text>
            </YStack>
          ) : errorMessage ? (
            <Text colorToken="textSecondary" variant="body">
              {errorMessage}
            </Text>
          ) : (
            <>
              {featuredCollection?.items[0] ? (
                <YStack gap={spacing.md}>
                  <SectionHeader
                    description={featuredCollection.description}
                    title={featuredCollection.title}
                  />
                  <FeaturedExperienceCard
                    badge={featuredCollection.items[0].badge ?? undefined}
                    description={featuredCollection.items[0].description}
                    imageSource={resolveExperienceImageSource(
                      featuredCollection.items[0].id,
                      featuredCollection.items[0].imageUrl,
                    )}
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

              {editorialCollections.map((collection) => (
                <YStack gap={spacing.md} key={collection.id}>
                  <SectionHeader
                    actionLabel="Ver tudo"
                    onPressAction={() =>
                      router.push(`/(guest)/discover/collection/${collection.id}` as Href)
                    }
                    title={collection.title}
                  />
                  <HorizontalExperienceList
                    items={collection.items.map(mapExperienceItem)}
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
            </>
          )}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
