import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { EditorialBadge } from '@/src/design-system/components/EditorialBadge';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ExperienceDetailHero } from '@/src/design-system/product/ExperienceDetailHero';
import { ExperienceInfoGrid } from '@/src/design-system/product/ExperienceInfoGrid';
import { IncludedItem } from '@/src/design-system/product/IncludedItem';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getExperienceById } from '@/src/mocks/experiences.mock';

function getBadgeTone(badge?: string) {
  if (!badge) {
    return 'accent' as const;
  }

  if (
    badge.includes('Mais reservada') ||
    badge.includes('Selecionado pelo hotel') ||
    badge.includes('Exclusivo do hotel')
  ) {
    return 'gold' as const;
  }

  return 'accent' as const;
}

type DetailSectionProps = {
  children: React.ReactNode;
  title: string;
};

function DetailSection({ children, title }: DetailSectionProps) {
  return (
    <YStack gap={spacing.md}>
      <Text variant="title3">{title}</Text>
      {children}
    </YStack>
  );
}

export default function ExperienceDetailScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<{
    collectionId?: string | string[];
    from?: string | string[];
    id?: string | string[];
  }>();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const collectionId = Array.isArray(params.collectionId) ? params.collectionId[0] : params.collectionId;
  const experience = getExperienceById(experienceId);
  const scheduleHref = {
    pathname: '/(guest)/discover/experience/[id]/schedule',
    params: {
      collectionId,
      from,
      id: experienceId,
    },
  } as Href;

  function handleGoBack() {
    if (from === 'reservations') {
      router.replace('/(guest)/stay/reservations');
      return;
    }

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

          <Button alignSelf="flex-start" onPress={() => router.replace('/(guest)/discover')}>
            <Text colorToken="textInverse" variant="bodyMedium">
              Voltar para Descobrir
            </Text>
          </Button>
        </YStack>
      </Screen>
    );
  }

  const infoItems = [
    {
      label: 'Duração',
      value: experience.durationLabel ?? 'Sob consulta',
    },
    {
      label: 'Disponibilidade',
      value: experience.availabilityLabel ?? experience.timeLabel ?? 'Sob agendamento',
    },
    {
      label: 'Local',
      value: experience.locationLabel ?? 'Informado na confirmação',
    },
    {
      label: 'Valor',
      value: experience.priceLabel,
    },
  ];
  const includedItems =
    experience.included ??
    ['Atendimento do hotel', 'Orientação da equipe sobre o melhor horário', 'Confirmação conforme disponibilidade'];
  const locationDescription =
    experience.locationDescription ??
    'A equipe do hotel orientará o local da experiência no momento da confirmação.';
  const policy =
    experience.policy ??
    'A confirmação está sujeita à disponibilidade de horário, com eventual contato da equipe caso seja necessário ajustar algum detalhe.';

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <YStack flex={1}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: tabBarHeight + spacing.xxxl,
          }}
          showsVerticalScrollIndicator={false}>
          <YStack gap={spacing.xxxl}>
            <ExperienceDetailHero imageSource={experience.imageSource} onPressBack={handleGoBack} />

            <YStack gap={spacing.xxxl} paddingHorizontal={spacing.xxl}>
              <YStack gap={spacing.lg}>
                {experience.badge ? (
                  <EditorialBadge label={experience.badge} tone={getBadgeTone(experience.badge)} />
                ) : null}

                <YStack gap={spacing.md}>
                  <Text letterSpacing={-0.5} variant="title1">
                    {experience.title}
                  </Text>
                  <Text colorToken="textSecondary" variant="body">
                    {experience.description}
                  </Text>
                </YStack>
              </YStack>

              <ExperienceInfoGrid items={infoItems} />

              <DetailSection title="O que está incluso">
                <YStack gap={spacing.md}>
                  {includedItems.map((item) => (
                    <IncludedItem key={item} label={item} />
                  ))}
                </YStack>
              </DetailSection>

              <DetailSection title="Local">
                <Text colorToken="textSecondary" variant="body">
                  {locationDescription}
                </Text>
              </DetailSection>

              <DetailSection title="Política">
                <Text colorToken="textSecondary" variant="body">
                  {policy}
                </Text>
              </DetailSection>

              <Button onPress={() => router.push(scheduleHref)}>
                <Text colorToken="textInverse" variant="bodyMedium">
                  Ver horários
                </Text>
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </Screen>
  );
}
