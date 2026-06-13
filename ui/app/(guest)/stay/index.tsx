import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import {
  Bell,
  Building2,
  CalendarCheck,
  Coffee,
  Clock,
  Info,
  MessageCircle,
  ReceiptText,
  Wifi,
} from 'lucide-react-native';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Text } from '@/src/design-system/components/Text';
import { StayInfoCard } from '@/src/design-system/product/StayInfoCard';
import { StayNavigationItem } from '@/src/design-system/product/StayNavigationItem';
import { StaySummaryCard } from '@/src/design-system/product/StaySummaryCard';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { stayMock } from '@/src/mocks/stay.mock';

const usefulInfoIcons = [Coffee, Clock, Info, Building2, MessageCircle] as const;

export default function StayScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const stay = stayMock;

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

          <StaySummaryCard stay={stay} />

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
              {stay.features.consumptionEnabled ? (
                <StayNavigationItem
                  description="Acompanhe lançamentos vinculados à sua hospedagem."
                  icon={ReceiptText}
                  onPress={() => router.push('/(guest)/stay/consumption')}
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
