import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { YStack } from 'tamagui';

import { Badge } from '@/src/design-system/components/Badge';
import { Button } from '@/src/design-system/components/Button';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ReservationSummaryCard } from '@/src/design-system/product/ReservationSummaryCard';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getExperience } from '@/src/services/atrio-api';
import { fetchReservationById } from '@/src/stores/reservations.store';
import { useSession } from '@/src/stores/session.store';
import { getReservationStatusLabel } from '@/src/mocks/reservations.mock';

export default function ExperienceConfirmationScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    reservationId?: string | string[];
  }>();
  const session = useSession();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const reservationId = Array.isArray(params.reservationId) ? params.reservationId[0] : params.reservationId;
  const [experienceTitle, setExperienceTitle] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Awaited<ReturnType<typeof fetchReservationById>> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.stayId || !experienceId || !reservationId) {
      return;
    }

    let isMounted = true;

    Promise.all([getExperience(experienceId), fetchReservationById(session.stayId, reservationId)])
      .then(([experienceResponse, reservationResponse]) => {
        if (!isMounted) {
          return;
        }

        setExperienceTitle(experienceResponse.title);
        setReservation(reservationResponse);
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Nao encontramos os detalhes desta reserva.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [experienceId, reservationId, session?.stayId]);

  if (!experienceTitle || !reservation) {
    return (
      <Screen justifyContent="center" safeAreaEdges={['bottom']}>
        <YStack gap={spacing.xxxl}>
          <YStack gap={spacing.md}>
            <Text variant="title1">Reserva não encontrada</Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              {errorMessage ?? 'Não encontramos os detalhes desta solicitação no momento.'}
            </Text>
          </YStack>

          <Button alignSelf="flex-start" onPress={() => router.replace('/(guest)/discover')}>
            <Text colorToken="textInverse" variant="bodyMedium">
              Voltar para Descobrir
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
              { label: 'Experiência', value: experienceTitle },
              { label: 'Data', value: reservation.dateLabel },
              { label: 'Horário', value: reservation.timeLabel },
              { label: 'Local', value: reservation.locationLabel },
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
