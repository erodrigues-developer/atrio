import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { Info, Shirt, Sparkles, Utensils } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
import { getStayConsumption, type ConsumptionResponse } from '@/src/services/atrio-api';
import { useSession } from '@/src/stores/session.store';

const consumptionIcons: Record<string, typeof Utensils> = {
  utensils: Utensils,
  sparkles: Sparkles,
  shirt: Shirt,
};

export default function ConsumptionScreen() {
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const session = useSession();
  const [consumption, setConsumption] = useState<ConsumptionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isFocused || !session?.stayId) {
      return;
    }

    let isMounted = true;

    getStayConsumption(session.stayId)
      .then((response) => {
        if (isMounted) {
          setConsumption(response);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Nao foi possivel carregar o consumo da estadia.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isFocused, session?.stayId]);

  function handleGoBack() {
    router.replace(resolveReturnTo(returnTo, '/(guest)/stay'));
  }

  function formatCurrency(amountCents: number, currency: string) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(amountCents / 100);
  }

  function formatDateLabel(value: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  if (!consumption) {
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
            <Card gap={spacing.sm} padding={spacing.xl}>
              <Text variant="bodyMedium">Nao foi possivel carregar o consumo.</Text>
              {errorMessage ? (
                <Text colorToken="textSecondary" variant="bodySmall">
                  {errorMessage}
                </Text>
              ) : null}
            </Card>
          </YStack>
        </ScrollView>
      </Screen>
    );
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
                  totalLabel={formatCurrency(consumption.totalAmountCents, consumption.currency)}
                  updatedAtLabel={`Atualizado em ${formatDateLabel(consumption.updatedAt)}`}
                />

                <YStack gap={spacing.lg}>
                  <SectionHeader title="Lançamentos" />

                  <Card borderRadius={radius.xl} paddingHorizontal={spacing.xl} paddingVertical={0}>
                    {consumption.items.map((item, index) => {
                      const Icon = consumptionIcons[item.icon];

                      return (
                        <ConsumptionItem
                          amountLabel={formatCurrency(item.amountCents, item.currency)}
                          dateLabel={formatDateLabel(item.occurredAt)}
                          description={item.description}
                          icon={Icon ?? Info}
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
