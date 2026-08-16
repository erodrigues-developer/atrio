import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import {
  Bell,
  Compass,
  Coffee,
  ScrollText,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { FeaturedExperienceCard } from '@/src/design-system/product/FeaturedExperienceCard';
import { InfoListItem } from '@/src/design-system/product/InfoListItem';
import { QuickActionCard } from '@/src/design-system/product/QuickActionCard';
import { RequestStatusCard } from '@/src/design-system/product/RequestStatusCard';
import { ReservationCard } from '@/src/design-system/product/ReservationCard';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getStayDashboard, type DashboardResponse } from '@/src/services/atrio-api';
import { resolveExperienceImageSource } from '@/src/services/experience-image';
import type { RequestStatus, RequestStatusType } from '@/src/mocks/requests.mock';
import type { ReservationStatus } from '@/src/mocks/reservations.mock';
import { useSession } from '@/src/stores/session.store';

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
    href: {
      pathname: '/(guest)/services/request/[type]',
      params: {
        type: 'room-service',
        returnTo: '/(guest)/today',
      },
    },
  },
  {
    title: 'Wi-Fi',
    icon: Wifi,
    href: {
      pathname: '/(guest)/stay/wifi',
      params: {
        returnTo: '/(guest)/today',
      },
    },
  },
  {
    title: 'Experiências',
    icon: Compass,
    href: '/(guest)/discover',
  },
] as const;

const todayGreetingMessage = 'Esperamos que sua estadia esteja sendo especial.';

const usefulInfoIcons: Record<string, LucideIcon> = {
  wifi: Wifi,
  breakfast: Coffee,
  checkout: Bell,
  'hotel-rules': ScrollText,
};

function mapRequestStatusType(status: string): RequestStatusType {
  switch (status) {
    case 'received':
    case 'preparing':
    case 'on_the_way':
    case 'completed':
      return status;
    default:
      return 'attention';
  }
}

function buildRequestDetails(request: {
  quantity?: number;
  roomNumber: string;
  timeLabel: string;
}) {
  const details: string[] = [];

  if (request.quantity) {
    details.push(`Quantidade: ${request.quantity}`);
  }

  details.push(`Quarto ${request.roomNumber}`);
  details.push(request.timeLabel);

  return details;
}

function getGreetingPeriod() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Bom dia';
  }

  if (hour < 18) {
    return 'Boa tarde';
  }

  return 'Boa noite';
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] ?? '';
}

function getUsefulInfoHref(usefulInfoId: string): Href {
  if (usefulInfoId === 'wifi') {
    return {
      pathname: '/(guest)/stay/wifi',
      params: {
        returnTo: '/(guest)/today',
      },
    } as Href;
  }

  if (usefulInfoId === 'breakfast') {
    return '/(guest)/discover';
  }

  return '/(guest)/stay';
}

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
  const session = useSession();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.stayId) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    getStayDashboard(session.stayId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setDashboard(response);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Nao foi possivel carregar a tela de hoje.',
        );
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session?.stayId]);

  const visibleReservations =
    dashboard?.reservations.filter(
      (reservation) => reservation.status !== 'completed' && reservation.status !== 'cancelled',
    ) ?? [];
  const requestsRoute: Href = {
    pathname: '/(guest)/stay/requests',
    params: {
      returnTo: '/(guest)/today',
    },
  };
  const guestFirstName = getFirstName(session?.guestName);

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <YStack alignItems="center" gap={spacing.lg} paddingTop={spacing.huge}>
            <ActivityIndicator color={colors.accent} />
            <Text colorToken="textSecondary" variant="body">
              Carregando sua estadia...
            </Text>
          </YStack>
        ) : errorMessage ? (
          <Card gap={spacing.lg} padding={spacing.xl}>
            <YStack gap={spacing.xs}>
              <Text variant="bodyMedium">Nao foi possivel carregar a tela de hoje.</Text>
              <Text colorToken="textSecondary" variant="bodySmall">
                {errorMessage}
              </Text>
            </YStack>
          </Card>
        ) : dashboard ? (
          <YStack>
            <YStack gap={spacing.sm}>
              <Text letterSpacing={-0.5} variant="title1">
                {getGreetingPeriod()}, {guestFirstName}
              </Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                {todayGreetingMessage}
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

            {dashboard.featuredExperience ? (
              <YStack marginTop={SECTION_SPACING.quickActionsToFeatured}>
                <SectionBlock description="Uma sugestão especial para este momento da estadia." title="Sugestão do dia">
                  <FeaturedExperienceCard
                    description={dashboard.featuredExperience.description}
                    imageSource={resolveExperienceImageSource(
                      dashboard.featuredExperience.id,
                      dashboard.featuredExperience.imageUrl,
                    )}
                    onPress={() =>
                      router.push({
                        pathname: '/(guest)/discover/experience/[id]',
                        params: {
                          id: dashboard.featuredExperience.id,
                          returnTo: '/(guest)/today',
                        },
                      } as Href)
                    }
                    priceLabel={dashboard.featuredExperience.priceLabel}
                    timeLabel={dashboard.featuredExperience.timeLabel}
                    title={dashboard.featuredExperience.title}
                  />
                </SectionBlock>
              </YStack>
            ) : null}

            <YStack marginTop={SECTION_SPACING.featuredToRequests}>
              <SectionBlock title="Solicitações em andamento">
                {dashboard.requests.length > 0 ? (
                  <YStack gap={spacing.md}>
                    {dashboard.requests.map((request) => (
                      <RequestStatusCard
                        details={buildRequestDetails({
                          quantity: request.quantity ?? undefined,
                          roomNumber: request.roomNumber,
                          timeLabel: request.timeLabel,
                        })}
                        key={request.id}
                        onPress={() => router.push(requestsRoute)}
                        status={request.statusLabel as RequestStatus}
                        statusType={mapRequestStatusType(request.status)}
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
                {visibleReservations.length > 0 ? (
                  <YStack gap={spacing.md}>
                    {visibleReservations.map((reservation) => (
                      <ReservationCard
                        dateLabel={reservation.dateLabel}
                        key={reservation.id}
                        status={reservation.status as ReservationStatus}
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
                      Ver experiências
                    </Text>
                  </Card>
                )}
              </SectionBlock>
            </YStack>

            <YStack marginTop={SECTION_SPACING.reservationsToInfo}>
              <SectionBlock title="Informações úteis">
                <Card borderRadius={radius.xl} paddingHorizontal={spacing.lg} paddingVertical={spacing.sm}>
                  {dashboard.usefulInfo.map((item, index) => (
                    <InfoListItem
                      key={item.id}
                      description={item.description}
                      icon={usefulInfoIcons[item.id] ?? ScrollText}
                      isLast={index === dashboard.usefulInfo.length - 1}
                      onPress={() => router.push(getUsefulInfoHref(item.id))}
                      title={item.title}
                    />
                  ))}
                </Card>
              </SectionBlock>
            </YStack>
          </YStack>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
