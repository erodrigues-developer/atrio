import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import {
  Bell,
  Coffee,
  MessageCircle,
  ScrollText,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';
import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { FeaturedExperienceCard } from '@/src/design-system/product/FeaturedExperienceCard';
import { InfoListItem } from '@/src/design-system/product/InfoListItem';
import { QuickActionCard } from '@/src/design-system/product/QuickActionCard';
import { RequestStatusCard } from '@/src/design-system/product/RequestStatusCard';
import { ReservationCard } from '@/src/design-system/product/ReservationCard';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { featuredExperienceMock } from '../../../src/mocks/experiences.mock';
import { guestMock } from '../../../src/mocks/guest.mock';
import { getRequestDetails } from '../../../src/mocks/requests.mock';
import { reservationsMock } from '../../../src/mocks/reservations.mock';
import { useRequests } from '../../../src/stores/requests.store';
import { todayMock, usefulInfoMock, type UsefulInfoId } from '../../../src/mocks/today.mock';

type SectionBlockProps = {
  children: React.ReactNode;
  description?: string;
  title: string;
};

type QuickAction = {
  href: Href;
  icon: LucideIcon;
  title: string;
};

const SECTION_SPACING = {
  greetingToQuickActions: 28,
  quickActionsToFeatured: 32,
  featuredToRequests: 32,
  requestsToReservations: 28,
  reservationsToInfo: 32,
} as const;

const quickActions: QuickAction[] = [
  {
    title: 'Pedir algo',
    icon: Bell,
    href: '/(guest)/services',
  },
  {
    title: 'Room service',
    icon: Utensils,
    href: '/(guest)/services',
  },
  {
    title: 'Wi-Fi',
    icon: Wifi,
    href: '/(guest)/stay/wifi',
  },
  {
    title: 'Concierge',
    icon: MessageCircle,
    href: '/(guest)/concierge',
  },
] as const;

const usefulInfoIcons: Record<UsefulInfoId, LucideIcon> = {
  wifi: Wifi,
  breakfast: Coffee,
  checkout: Bell,
  'hotel-rules': ScrollText,
};

function SectionBlock({ children, description, title }: SectionBlockProps) {
  return (
    <YStack gap={spacing.md}>
      <YStack gap={spacing.xs}>
        <Text variant="title3">{title}</Text>
        {description ? (
          <Text colorToken="textSecondary" variant="bodySmall">
            {description}
          </Text>
        ) : null}
      </YStack>
      {children}
    </YStack>
  );
}

export default function TodayScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const requests = useRequests();
  const requestsRoute: Href = '/(guest)/stay/requests';

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack>
          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.5} variant="title1">
              {todayMock.greetingPeriod}, {guestMock.firstName}
            </Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              {todayMock.message}
            </Text>
          </YStack>

          <YStack marginTop={SECTION_SPACING.greetingToQuickActions}>
            <SectionBlock title="Ações rápidas">
              <XStack flexWrap="wrap" justifyContent="space-between" rowGap={spacing.md}>
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.title}
                    icon={action.icon}
                    onPress={() => router.push(action.href)}
                    title={action.title}
                  />
                ))}
              </XStack>
            </SectionBlock>
          </YStack>

          <YStack marginTop={SECTION_SPACING.quickActionsToFeatured}>
            <SectionBlock description={todayMock.contextNote} title="Selecionado para hoje">
              <FeaturedExperienceCard
                badge={featuredExperienceMock.badge}
                description={featuredExperienceMock.description}
                imageSource={featuredExperienceMock.imageSource}
                onPress={() =>
                  router.push(`/(guest)/discover/experience/${featuredExperienceMock.id}` as Href)
                }
                priceLabel={featuredExperienceMock.priceLabel}
                timeLabel={featuredExperienceMock.timeLabel}
                title={featuredExperienceMock.title}
              />
            </SectionBlock>
          </YStack>

          <YStack marginTop={SECTION_SPACING.featuredToRequests}>
            <SectionBlock title="Solicitações em andamento">
              {requests.length > 0 ? (
                <YStack gap={spacing.md}>
                  {requests.map((request) => (
                    <RequestStatusCard
                      details={getRequestDetails(request)}
                      key={request.id}
                      onPress={() => router.push(requestsRoute)}
                      status={request.status}
                      statusType={request.statusType}
                      timeLabel={request.timeLabel}
                      title={request.title}
                    />
                  ))}
                </YStack>
              ) : (
                <Card gap={spacing.md} padding={spacing.lg}>
                  <Text colorToken="textSecondary" variant="body">
                    Você ainda não tem solicitações em andamento.
                  </Text>
                  <Text colorToken="accent" onPress={() => router.push('/(guest)/services')} variant="bodyMedium">
                    Fazer uma solicitação
                  </Text>
                </Card>
              )}
            </SectionBlock>
          </YStack>

          <YStack marginTop={SECTION_SPACING.requestsToReservations}>
            <SectionBlock title="Próximas reservas">
              {reservationsMock.length > 0 ? (
                <YStack gap={spacing.md}>
                  {reservationsMock.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      status={reservation.status}
                      timeLabel={reservation.timeLabel}
                      title={reservation.title}
                    />
                  ))}
                </YStack>
              ) : (
                <Card gap={spacing.md} padding={spacing.lg}>
                  <Text colorToken="textSecondary" variant="body">
                    Você ainda não tem reservas para hoje.
                  </Text>
                  <Text colorToken="accent" onPress={() => router.push('/(guest)/discover')} variant="bodyMedium">
                    Descobrir experiências
                  </Text>
                </Card>
              )}
            </SectionBlock>
          </YStack>

          <YStack marginTop={SECTION_SPACING.reservationsToInfo}>
            <SectionBlock title="Informações úteis">
              <Card borderRadius={radius.xl} paddingHorizontal={spacing.lg} paddingVertical={spacing.sm}>
                {usefulInfoMock.map((item, index) => {
                  const href =
                    item.id === 'wifi'
                      ? '/(guest)/stay/wifi'
                      : item.id === 'breakfast'
                        ? '/(guest)/discover'
                        : '/(guest)/stay';

                  return (
                    <InfoListItem
                      key={item.id}
                      description={item.description}
                      icon={usefulInfoIcons[item.id]}
                      isLast={index === usefulInfoMock.length - 1}
                      onPress={() => router.push(href)}
                      title={item.title}
                    />
                  );
                })}
              </Card>
            </SectionBlock>
          </YStack>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
