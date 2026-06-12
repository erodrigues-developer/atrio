import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ReservationCard } from '@/src/design-system/product/ReservationCard';
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

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxl}>
          <BackButton accessibilityLabel="Voltar" onPress={handleGoBack} />

          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.5} variant="title1">
              Minhas reservas
            </Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              Acompanhe as experiências recebidas pelo hotel durante a sua estadia.
            </Text>
          </YStack>

          {reservations.length > 0 ? (
            <YStack gap={spacing.md}>
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  status={reservation.status}
                  timeLabel={reservation.timeLabel}
                  title={reservation.title}
                />
              ))}
            </YStack>
          ) : (
            <Card gap={spacing.lg} padding={spacing.xl}>
              <YStack gap={spacing.xs}>
                <Text variant="bodyMedium">Você ainda não tem reservas registradas.</Text>
                <Text colorToken="textSecondary" variant="bodySmall">
                  Quando solicitar uma experiência, ela aparecerá aqui para acompanhamento.
                </Text>
              </YStack>

              <Button alignSelf="flex-start" onPress={() => router.push('/(guest)/discover')}>
                Descobrir experiências
              </Button>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
