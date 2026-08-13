import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ReservationCard } from '@/src/design-system/product/ReservationCard';
import { resolveReturnTo } from '@/src/navigation/return-to';
import { spacing } from '@/src/design-system/tokens/spacing';
import { loadReservations, useReservations } from '@/src/stores/reservations.store';
import { useSession } from '@/src/stores/session.store';

export default function StayReservationsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const session = useSession();
  const reservationsState = useReservations();

  useEffect(() => {
    if (!session?.stayId) {
      return;
    }

    loadReservations(session.stayId).catch(() => undefined);
  }, [session?.stayId]);

  function handleGoBack() {
    router.replace(resolveReturnTo(returnTo, '/(guest)/stay'));
  }

  function handleOpenExperience(experienceId: string) {
    router.push({
      pathname: '/(guest)/discover/experience/[id]',
      params: {
        id: experienceId,
        returnTo: '/(guest)/stay/reservations',
      },
    } as Href);
  }

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.huge + spacing.md,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxl}>
          <BackButton accessibilityLabel="Voltar" onPress={handleGoBack} />

          <YStack gap={spacing.xxxl}>
            <YStack gap={spacing.sm}>
              <Text letterSpacing={-0.5} variant="title1">
                Minhas reservas
              </Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                Acompanhe as experiências reservadas durante a sua estadia.
              </Text>
            </YStack>

            {reservationsState.errorMessage ? (
              <Text colorToken="textSecondary" variant="bodySmall">
                {reservationsState.errorMessage}
              </Text>
            ) : null}

            {reservationsState.items.length > 0 ? (
              <YStack gap={spacing.lg}>
                {reservationsState.items.map((reservation) => (
                  <ReservationCard
                    dateLabel={reservation.dateLabel}
                    key={reservation.id}
                    locationLabel={reservation.locationLabel}
                    onPress={() => handleOpenExperience(reservation.experienceId)}
                    showDetailsAction
                    status={reservation.status}
                    timeLabel={reservation.timeLabel}
                    title={reservation.title}
                  />
                ))}
              </YStack>
            ) : (
              <EmptyState
                actionLabel="Ver experiências"
                description="Explore as experiências selecionadas pelo hotel e solicite uma reserva durante a sua estadia."
                onActionPress={() => router.push('/(guest)/discover')}
                onSecondaryActionPress={() => router.push('/(guest)/today')}
                secondaryActionLabel="Voltar para Hoje"
                title="Você ainda não tem reservas."
              />
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
