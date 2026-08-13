import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';
import { YStack } from 'tamagui';

import { Badge } from '@/src/design-system/components/Badge';
import { Button } from '@/src/design-system/components/Button';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ReservationSummaryCard } from '@/src/design-system/product/ReservationSummaryCard';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getExperienceById } from '@/src/mocks/experiences.mock';
import { getReservationStatusLabel } from '@/src/mocks/reservations.mock';
import { useReservations } from '@/src/stores/reservations.store';

export default function ExperienceConfirmationScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    reservationId?: string | string[];
  }>();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const reservationId = Array.isArray(params.reservationId) ? params.reservationId[0] : params.reservationId;
  const experience = getExperienceById(experienceId);
  const reservations = useReservations();
  const reservation =
    reservations.find((item) => item.id === reservationId) ??
    reservations.find((item) => item.experienceId === experienceId);

  if (!experience || !reservation) {
    return (
      <Screen justifyContent="center" safeAreaEdges={['bottom']}>
        <YStack gap={spacing.xxxl}>
          <YStack gap={spacing.md}>
            <Text variant="title1">Reserva não encontrada</Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              Não encontramos os detalhes desta solicitação no momento.
            </Text>
          </YStack>

          <Button alignSelf="flex-start" onPress={() => router.replace('/(guest)/discover')}>
            <Text colorToken="textInverse" variant="bodyMedium">
              Voltar para Experiências
            </Text>
          </Button>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap={spacing.xxxl} paddingTop={spacing.huge}>
          <YStack alignItems="center" gap={spacing.lg}>
            <YStack
              alignItems="center"
              backgroundColor={colors.accentSoft}
              borderRadius={radius.pill}
              height={72}
              justifyContent="center"
              width={72}>
              <CircleCheckBig color={colors.accent} size={30} strokeWidth={1.9} />
            </YStack>

            <YStack alignItems="center" gap={spacing.sm}>
              <Badge label={getReservationStatusLabel(reservation.status)} tone="accent" />
              <Text textAlign="center" variant="title2">
                Sua reserva foi recebida.
              </Text>
              <Text colorToken="textSecondary" maxWidth="88%" textAlign="center" variant="body">
                Preparamos os detalhes e avisaremos caso haja alguma atualização.
              </Text>
            </YStack>
          </YStack>

          <ReservationSummaryCard
            rows={[
              { label: 'Experiência', value: experience.title },
              { label: 'Data', value: reservation.dateLabel },
              { label: 'Horário', value: reservation.timeLabel },
              { label: 'Local', value: reservation.locationLabel ?? experience.locationLabel ?? 'Sob confirmação' },
              { label: 'Status', value: getReservationStatusLabel(reservation.status) },
            ]}
          />
        </YStack>

        <YStack gap={spacing.sm}>
          <Button onPress={() => router.replace('/(guest)/stay/reservations')}>
            Ver minhas reservas
          </Button>
          <Button onPress={() => router.replace('/(guest)/today')} variant="ghost">
            <Text colorToken="textSecondary" variant="bodyMedium">
              Voltar para Hoje
            </Text>
          </Button>
        </YStack>
      </YStack>
    </Screen>
  );
}
