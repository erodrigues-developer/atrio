import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams } from 'expo-router';
import { Info, Shirt, Sparkles, Utensils } from 'lucide-react-native';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Card } from '@/src/design-system/components/Card';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { Screen } from '@/src/design-system/components/Screen';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Text } from '@/src/design-system/components/Text';
import { ConsumptionItem } from '@/src/design-system/product/ConsumptionItem';
import { ConsumptionSummaryCard } from '@/src/design-system/product/ConsumptionSummaryCard';
import { InfoNotice } from '@/src/design-system/product/InfoNotice';
import { resolveReturnTo } from '@/src/navigation/return-to';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getConsumptionMock } from '@/src/mocks/consumption.mock';

const consumptionIcons = {
  utensils: Utensils,
  sparkles: Sparkles,
  shirt: Shirt,
} as const;

export default function ConsumptionScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const consumption = getConsumptionMock();

  function handleGoBack() {
    router.replace(resolveReturnTo(returnTo, '/(guest)/stay'));
  }

  if (!consumption.enabled) {
    return (
      <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.lg,
            paddingHorizontal: spacing.xxl,
            paddingBottom: tabBarHeight + spacing.xxxl,
          }}
          showsVerticalScrollIndicator={false}>
          <YStack gap={spacing.xxl}>
            <BackButton accessibilityLabel="Voltar" onPress={handleGoBack} />

            <EmptyState
              actionLabel="Voltar para Estadia"
              description="Esta visualização opcional não está disponível para a sua hospedagem agora."
              onActionPress={handleGoBack}
              title="Consumo indisponível no momento."
            />
          </YStack>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxl}>
          <BackButton accessibilityLabel="Voltar" onPress={handleGoBack} />

          <YStack gap={spacing.xxxl}>
            <YStack gap={spacing.sm}>
              <Text letterSpacing={-0.5} variant="title1">
                Consumo
              </Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                Acompanhe os lançamentos registrados durante a sua estadia.
              </Text>
            </YStack>

            {consumption.view === 'unavailable' ? (
              <EmptyState
                actionLabel={consumption.unavailableState.actionLabel}
                description={consumption.unavailableState.description}
                onActionPress={() => router.push('/(guest)/concierge')}
                title={consumption.unavailableState.title}
              />
            ) : consumption.view === 'empty' ? (
              <EmptyState
                actionLabel="Voltar para Estadia"
                description={consumption.emptyState.description}
                onActionPress={handleGoBack}
                title={consumption.emptyState.title}
              />
            ) : (
              <YStack gap={spacing.xl}>
                <ConsumptionSummaryCard
                  itemCountLabel={`${consumption.items.length} lançamentos registrados`}
                  totalLabel={consumption.totalLabel}
                  updatedAtLabel={consumption.updatedAtLabel}
                />

                <YStack gap={spacing.lg}>
                  <SectionHeader title="Lançamentos" />

                  <Card borderRadius={radius.xl} paddingHorizontal={spacing.xl} paddingVertical={0}>
                    {consumption.items.map((item, index) => {
                      const Icon = consumptionIcons[item.icon];

                      return (
                        <ConsumptionItem
                          amountLabel={item.amountLabel}
                          dateLabel={item.dateLabel}
                          description={item.description}
                          icon={Icon}
                          isLast={index === consumption.items.length - 1}
                          key={item.id}
                          title={item.title}
                        />
                      );
                    })}
                  </Card>
                </YStack>

                <InfoNotice
                  description="Valores sujeitos à conferência do hotel. Em caso de dúvida, fale com o concierge."
                  icon={Info}
                />
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
