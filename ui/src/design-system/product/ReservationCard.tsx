import { XStack, YStack } from 'tamagui';

import { StatusBadge, type StatusBadgeTone } from '@/src/design-system/components/StatusBadge';
import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getReservationStatusLabel, type ReservationStatus } from '@/src/mocks/reservations.mock';

type Props = {
  dateLabel?: string;
  locationLabel?: string;
  onPress?: () => void;
  showDetailsAction?: boolean;
  status: ReservationStatus;
  timeLabel: string;
  title: string;
};

const reservationStatusTones: Record<ReservationStatus, StatusBadgeTone> = {
  requested: 'accent',
  confirmed: 'success',
  in_progress: 'warning',
  completed: 'muted',
  cancelled: 'danger',
};

function ReservationDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack alignItems="flex-start" gap={spacing.md}>
      <Text colorToken="textSecondary" minWidth={64} variant="bodySmall">
        {label}
      </Text>
      <Text flex={1} variant="bodySmall">
        {value}
      </Text>
    </XStack>
  );
}

export function ReservationCard({
  dateLabel,
  locationLabel,
  onPress,
  showDetailsAction = false,
  status,
  timeLabel,
  title,
}: Props) {
  const metadataLabel = dateLabel ? `${dateLabel} · ${timeLabel}` : timeLabel;
  const statusLabel = getReservationStatusLabel(status);
  const hasDetailsLayout = Boolean(dateLabel && locationLabel);

  return (
    <Card borderRadius={radius.xl} gap={spacing.lg} padding={spacing.lg}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap={spacing.md}>
        <YStack flex={1} gap={spacing.xs}>
          <Text variant="bodyMedium">{title}</Text>
          {!hasDetailsLayout ? (
            <Text colorToken="textSecondary" variant="bodySmall">
              {metadataLabel}
            </Text>
          ) : null}
        </YStack>
        <StatusBadge label={statusLabel} tone={reservationStatusTones[status]} />
      </XStack>

      {hasDetailsLayout ? (
        <YStack gap={spacing.sm}>
          <ReservationDetailRow label="Data" value={dateLabel ?? '-'} />
          <ReservationDetailRow label="Horário" value={timeLabel} />
          <ReservationDetailRow label="Local" value={locationLabel ?? '-'} />
        </YStack>
      ) : null}

      {showDetailsAction && onPress ? (
        <Button alignSelf="flex-start" onPress={onPress} variant="ghost">
          <Text colorToken="accent" variant="bodyMedium">
            Ver detalhes
          </Text>
        </Button>
      ) : null}
    </Card>
  );
}
