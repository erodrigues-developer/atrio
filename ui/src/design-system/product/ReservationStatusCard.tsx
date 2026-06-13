import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { StatusBadge, type StatusBadgeTone } from '@/src/design-system/components/StatusBadge';
import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getReservationStatusLabel, type ReservationItem, type ReservationStatus } from '@/src/mocks/reservations.mock';

type ReservationStatusCardProps = Pick<
  ReservationItem,
  'dateLabel' | 'locationLabel' | 'note' | 'status' | 'timeLabel' | 'title'
> & {
  onPress?: () => void;
};

const reservationStatusTones: Record<ReservationStatus, StatusBadgeTone> = {
  requested: 'accent',
  confirmed: 'success',
  in_progress: 'warning',
  completed: 'muted',
  cancelled: 'danger',
};

export function ReservationStatusCard({
  dateLabel,
  locationLabel,
  note,
  onPress,
  status,
  timeLabel,
  title,
}: ReservationStatusCardProps) {
  const cardContent = (
    <Card borderRadius={radius.xl} gap={spacing.lg} padding={spacing.xl}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap={spacing.md}>
        <Text flex={1} variant="bodyMedium">
          {title}
        </Text>
        <StatusBadge label={getReservationStatusLabel(status)} tone={reservationStatusTones[status]} />
      </XStack>

      <YStack gap={spacing.xs}>
        <Text variant="body">{`${dateLabel} · ${timeLabel}`}</Text>
        <Text colorToken="textSecondary" variant="bodySmall">
          {locationLabel}
        </Text>
        {note ? (
          <Text colorToken="textSecondary" variant="bodySmall">
            {note}
          </Text>
        ) : null}
      </YStack>
    </Card>
  );

  if (!onPress) {
    return cardContent;
  }

  return (
    <Pressable
      accessibilityLabel={`Abrir detalhes de ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.xl,
        opacity: pressed ? 0.9 : 1,
      })}>
      {cardContent}
    </Pressable>
  );
}
