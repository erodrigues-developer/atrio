import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { DateOptionChip } from '@/src/design-system/components/DateOptionChip';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { TimeSlotChip } from '@/src/design-system/components/TimeSlotChip';
import { ReservationSummaryCard } from '@/src/design-system/product/ReservationSummaryCard';
import { goBackOrReplace } from '@/src/navigation/go-back';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';
import {
  getExperience,
  getExperienceAvailability,
  type ExperienceAvailabilityResponse,
  type ExperienceDetailResponse,
} from '@/src/services/atrio-api';
import { createReservation } from '@/src/stores/reservations.store';
import { useSession } from '@/src/stores/session.store';

const CONTENT_HORIZONTAL_PADDING = spacing.xxl;
const SLOT_GAP = spacing.md;

export default function ExperienceScheduleScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    returnTo?: string | string[];
  }>();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const session = useSession();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const [experience, setExperience] = useState<ExperienceDetailResponse | null>(null);
  const [availability, setAvailability] = useState<ExperienceAvailabilityResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>();
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionPromiseRef = useRef<Promise<unknown> | null>(null);

  useEffect(() => {
    if (!experienceId) {
      return;
    }

    let isMounted = true;

    Promise.all([getExperience(experienceId), getExperienceAvailability(experienceId)])
      .then(([experienceResponse, availabilityResponse]) => {
        if (!isMounted) {
          return;
        }

        setExperience(experienceResponse);
        setAvailability(availabilityResponse);
        setSelectedDayId(availabilityResponse.days[0]?.id);
        setSelectedSlotId(undefined);
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Nao foi possivel carregar os horarios.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [experienceId]);

  function handleGoBack() {
    if (!experienceId) {
      goBackOrReplace('/(guest)/discover');
      return;
    }

    goBackOrReplace({
      pathname: '/(guest)/discover/experience/[id]',
      params: {
        id: experienceId,
        returnTo,
      },
    } as Href);
  }

  if (!experience || !availability) {
    return (
      <Screen justifyContent="center" safeAreaEdges={['bottom']}>
        <YStack gap={spacing.xxxl}>
          <YStack gap={spacing.md}>
            <Text variant="title1">Experiência não encontrada</Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              {errorMessage ?? 'Não conseguimos encontrar os horários desta experiência no momento.'}
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

  const days = availability.days ?? [];
  const selectedDay = days.find((day) => day.id === selectedDayId) ?? days[0];
  const selectedSlot = selectedDay?.slots.find((slot) => slot.id === selectedSlotId && slot.available);
  const hasAvailableSlots = Boolean(selectedDay?.slots.some((slot) => slot.available));
  const columnCount = width >= 390 ? 3 : 2;
  const availableWidth = width - CONTENT_HORIZONTAL_PADDING * 2 - SLOT_GAP * (columnCount - 1);
  const slotWidth = Math.floor(availableWidth / columnCount);
  const summaryDateLabel = selectedDay ? `${selectedDay.label}, ${selectedDay.dateLabel}` : undefined;
  const experienceLocationLabel = experience.locationLabel ?? 'Informado na confirmação';
  const hasSelection = Boolean(selectedDay && selectedSlot);
  const canSubmit = hasSelection && !isSubmitting;
  const ctaBackgroundColor = hasSelection ? colors.accent : colors.surfaceMuted;
  const ctaTextColor = hasSelection ? 'textInverse' : 'textMuted';

  function handleSelectDay(dayId: string) {
    if (dayId === selectedDayId) {
      return;
    }

    setSelectedDayId(dayId);
    setSelectedSlotId(undefined);
  }

  function handleSubmitReservation() {
    if (!session?.stayId || !experienceId || !selectedSlot || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    submissionPromiseRef.current = createReservation(session.stayId, {
      experienceId,
      slotId: selectedSlot.id,
      scheduledAt: selectedSlot.startsAt,
      partySize: 2,
    })
      .then((reservation) => {
        router.replace({
          pathname: '/(guest)/discover/experience/[id]/confirmation',
          params: {
            id: experienceId,
            reservationId: reservation.id,
          },
        } as Href);
      })
      .catch((error) => {
        setIsSubmitting(false);
        setErrorMessage(
          error instanceof Error ? error.message : 'Nao foi possivel solicitar a reserva.',
        );
      });
  }

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: tabBarHeight + spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxxl}>
          <YStack gap={spacing.xl} paddingHorizontal={CONTENT_HORIZONTAL_PADDING}>
            <BackButton accessibilityLabel="Voltar" label="Voltar" onPress={handleGoBack} />

            <YStack gap={spacing.sm}>
              <Text letterSpacing={-0.4} variant="title1">
                Escolha um horário
              </Text>
              <Text variant="bodyMedium">{experience.title}</Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                Selecione uma data e horário para esta experiência.
              </Text>
            </YStack>
          </YStack>

          {days.length > 0 ? (
            <YStack gap={spacing.md}>
              <YStack gap={spacing.xs} paddingHorizontal={CONTENT_HORIZONTAL_PADDING}>
                <Text variant="title3">Data</Text>
              </YStack>

              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}>
                <XStack gap={spacing.md}>
                  {days.map((day) => (
                    <DateOptionChip
                      dateLabel={day.dateLabel}
                      key={day.id}
                      label={day.label}
                      onPress={() => handleSelectDay(day.id)}
                      selected={day.id === selectedDay?.id}
                    />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          ) : null}

          <YStack gap={spacing.lg} paddingHorizontal={CONTENT_HORIZONTAL_PADDING}>
            <Text variant="title3">Horários disponíveis</Text>

            {selectedDay ? (
              hasAvailableSlots ? (
                <XStack flexWrap="wrap" gap={SLOT_GAP}>
                  {selectedDay.slots.map((slot) => (
                    <TimeSlotChip
                      available={slot.available}
                      key={`${selectedDay.id}-${slot.id}`}
                      onPress={() => setSelectedSlotId(slot.id)}
                      selected={slot.id === selectedSlotId}
                      time={slot.time}
                      width={slotWidth}
                    />
                  ))}
                </XStack>
              ) : (
                <Card gap={spacing.sm}>
                  <Text variant="bodyMedium">Nenhum horário disponível para este dia.</Text>
                  <Text colorToken="textSecondary" variant="bodySmall">
                    Tente outra data ou fale com o concierge para receber ajuda.
                  </Text>
                  <Button alignSelf="flex-start" onPress={() => router.push('/(guest)/concierge')} variant="ghost">
                    <Text colorToken="textSecondary" variant="bodyMedium">
                      Falar com o concierge
                    </Text>
                  </Button>
                </Card>
              )
            ) : (
              <Card gap={spacing.sm}>
                <Text variant="bodyMedium">Nenhum horário disponível para esta experiência.</Text>
                <Text colorToken="textSecondary" variant="bodySmall">
                  Não conseguimos carregar opções de data no momento.
                </Text>
              </Card>
            )}
          </YStack>

          <YStack gap={spacing.lg} paddingHorizontal={CONTENT_HORIZONTAL_PADDING}>
            {selectedDay && selectedSlot && summaryDateLabel ? (
              <ReservationSummaryCard
                rows={[
                  { label: 'Experiência', value: experience.title },
                  { label: 'Data', value: summaryDateLabel },
                  { label: 'Horário', value: selectedSlot.time },
                  { label: 'Local', value: experienceLocationLabel },
                  { label: 'Valor', value: experience.priceLabel },
                ]}
              />
            ) : (
              <Text colorToken="textSecondary" variant="body">
                Selecione um horário para ver o resumo da reserva.
              </Text>
            )}

            {errorMessage ? (
              <Text colorToken="danger" variant="bodySmall">
                {errorMessage}
              </Text>
            ) : null}

            <Button
              accessibilityLabel="Solicitar reserva"
              backgroundColor={ctaBackgroundColor}
              disabled={!canSubmit}
              onPress={handleSubmitReservation}
              pressStyle={{
                backgroundColor: colors.accentHover,
              }}>
              <XStack alignItems="center" gap={spacing.sm}>
                {isSubmitting ? <ActivityIndicator color={colors.textInverse} /> : null}
                <Text colorToken={isSubmitting ? 'textInverse' : ctaTextColor} variant="bodyMedium">
                  {isSubmitting ? 'Solicitando...' : 'Solicitar reserva'}
                </Text>
              </XStack>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
