import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import {
  Bell,
  Building2,
  CalendarCheck,
  Coffee,
  Info,
  MessageCircle,
  ReceiptText,
  Wifi,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Text } from '@/src/design-system/components/Text';
import { StayInfoCard } from '@/src/design-system/product/StayInfoCard';
import { StayNavigationItem } from '@/src/design-system/product/StayNavigationItem';
import { StaySummaryCard } from '@/src/design-system/product/StaySummaryCard';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import {
  getStay,
  getStayConsumption,
  type ConsumptionResponse,
  type StaySummaryResponse,
} from '@/src/services/atrio-api';
import { useSession } from '@/src/stores/session.store';

const usefulInfoIcons = [Coffee, Info, Building2, MessageCircle, Info] as const;

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amountCents / 100);
}

export default function StayScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const session = useSession();
  const [stay, setStay] = useState<StaySummaryResponse | null>(null);
  const [consumption, setConsumption] = useState<ConsumptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.stayId) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    Promise.all([getStay(session.stayId), getStayConsumption(session.stayId)])
      .then(([stayResponse, consumptionResponse]) => {
        if (!isMounted) {
          return;
        }

        setStay(stayResponse);
        setConsumption(consumptionResponse);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Nao foi possivel carregar os dados da estadia.',
        );
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session?.stayId]);

  const consumptionSummaryLabel =
    consumption?.enabled && consumption.view === 'ready'
      ? formatCurrency(consumption.totalAmountCents, consumption.currency)
      : undefined;

  if (isLoading) {
    return (
      <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
        <YStack alignItems="center" flex={1} gap={spacing.lg} justifyContent="center">
          <ActivityIndicator color={colors.accent} />
          <Text colorToken="textSecondary" variant="body">
            Carregando sua estadia...
          </Text>
        </YStack>
      </Screen>
    );
  }

  if (errorMessage) {
    return (
      <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.lg,
            paddingHorizontal: spacing.xxl,
            paddingBottom: tabBarHeight + spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}>
          <Card gap={spacing.sm} padding={spacing.xl}>
            <Text variant="bodyMedium">Nao foi possivel carregar a estadia.</Text>
            <Text colorToken="textSecondary" variant="bodySmall">
              {errorMessage}
            </Text>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  if (!stay) {
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
              <Text variant="title1">Estadia</Text>
              <Text colorToken="textSecondary" variant="body">
                Informações e acompanhamentos da sua hospedagem.
              </Text>
            </YStack>

            <Card borderRadius={radius.xl} gap={spacing.sm} padding={spacing.xl}>
              <Text variant="bodyMedium">Nenhuma estadia ativa encontrada.</Text>
              <Text colorToken="textSecondary" variant="bodySmall">
                Volte para a identificação da estadia ou fale com o concierge para receber ajuda.
              </Text>
            </Card>
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
        <YStack gap={spacing.xxxl}>
          <YStack gap={spacing.sm}>
            <Text variant="title1">Estadia</Text>
            <Text colorToken="textSecondary" variant="body">
              Informações e acompanhamentos da sua hospedagem.
            </Text>
          </YStack>

          <StaySummaryCard
            stay={{
              hotelName: stay.hotelName,
              roomNumber: stay.roomNumber,
              statusLabel: stay.statusLabel,
              checkInLabel: stay.checkInLabel,
              checkOutLabel: stay.checkOutLabel,
              checkOutTimeLabel: stay.checkOutTime,
              summaries: stay.summaries,
              usefulInfo: stay.usefulInfo,
            }}
          />

          <YStack gap={spacing.lg}>
            <SectionHeader title="Acessos rápidos" />

            <YStack gap={spacing.md}>
              <StayNavigationItem
                description="Veja o nome da rede e a senha da hospedagem."
                icon={Wifi}
                onPress={() =>
                  router.push({
                    pathname: '/(guest)/stay/wifi',
                    params: {
                      returnTo: '/(guest)/stay',
                    },
                  } as Href)
                }
                title="Wi-Fi"
              />
              <StayNavigationItem
                description="Acompanhe pedidos feitos ao hotel durante a estadia."
                icon={Bell}
                onPress={() =>
                  router.push({
                    pathname: '/(guest)/stay/requests',
                    params: {
                      returnTo: '/(guest)/stay',
                    },
                  } as Href)
                }
                summaryLabel={stay.summaries.requests}
                title="Minhas solicitações"
              />
              <StayNavigationItem
                description="Veja experiências reservadas e acompanhe cada confirmação."
                icon={CalendarCheck}
                onPress={() =>
                  router.push({
                    pathname: '/(guest)/stay/reservations',
                    params: {
                      returnTo: '/(guest)/stay',
                    },
                  } as Href)
                }
                summaryLabel={stay.summaries.reservations}
                title="Minhas reservas"
              />
              {consumption?.enabled ? (
                <StayNavigationItem
                  description="Acompanhe lançamentos vinculados à sua hospedagem."
                  icon={ReceiptText}
                  onPress={() =>
                    router.push({
                      pathname: '/(guest)/stay/consumption',
                      params: {
                        returnTo: '/(guest)/stay',
                      },
                    } as Href)
                  }
                  summaryLabel={consumptionSummaryLabel}
                  title="Consumo"
                />
              ) : null}
            </YStack>
          </YStack>

          <YStack gap={spacing.lg}>
            <SectionHeader title="Regras e informações úteis" />

            <Card borderRadius={radius.xl} paddingHorizontal={spacing.xl} paddingVertical={0}>
              {stay.usefulInfo.map((item, index) => {
                const Icon = usefulInfoIcons[index] ?? Info;

                return (
                  <StayInfoCard
                    description={item.description}
                    icon={Icon}
                    isLast={index === stay.usefulInfo.length - 1}
                    key={item.id}
                    title={item.title}
                  />
                );
              })}
            </Card>
          </YStack>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
