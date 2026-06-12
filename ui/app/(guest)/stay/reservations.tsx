import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ReservationStatusCard } from '@/src/design-system/product/ReservationStatusCard';
import { spacing } from '@/src/design-system/tokens/spacing';
import { useReservations } from '@/src/stores/reservations.store';

export default function StayReservationsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const reservations = useReservations();

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(guest)/stay');
  }

  function handleOpenExperience(experienceId: string) {
    router.push({
      pathname: '/(guest)/discover/experience/[id]',
      params: {
        id: experienceId,
      },
    } as Href);
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
                Minhas reservas
              </Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                Acompanhe as experiências reservadas durante sua estadia.
              </Text>
            </YStack>

            {reservations.length > 0 ? (
              <YStack gap={spacing.lg}>
                {reservations.map((reservation) => (
                  <ReservationStatusCard
                    dateLabel={reservation.dateLabel}
                    key={reservation.id}
                    locationLabel={reservation.locationLabel}
                    note={reservation.note}
                    onPress={() => handleOpenExperience(reservation.experienceId)}
                    status={reservation.status}
                    timeLabel={reservation.timeLabel}
                    title={reservation.title}
                  />
                ))}
              </YStack>
            ) : (
              <EmptyState
                actionLabel="Descobrir experiências"
                description="Quando escolher uma experiência, ela aparecerá aqui para acompanhamento."
                onActionPress={() => router.push('/(guest)/discover')}
                title="Você ainda não tem reservas."
              />
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
