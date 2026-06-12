import { XStack, YStack } from 'tamagui';

import { StatusBadge, type StatusBadgeTone } from '@/src/design-system/components/StatusBadge';
import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { ReservationStatus } from '@/src/mocks/reservations.mock';

type Props = {
  dateLabel?: string;
  status: ReservationStatus;
  timeLabel: string;
  title: string;
};

const reservationStatusTones: Record<ReservationStatus, StatusBadgeTone> = {
  Solicitada: 'accent',
  Confirmada: 'success',
  'Em andamento': 'warning',
  Concluída: 'muted',
  Cancelada: 'danger',
};

export function ReservationCard({ dateLabel, status, timeLabel, title }: Props) {
  const metadataLabel = dateLabel ? `${dateLabel} · ${timeLabel}` : timeLabel;

  return (
    <Card borderRadius={radius.xl} gap={spacing.lg} padding={spacing.lg}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap={spacing.md}>
        <YStack flex={1} gap={spacing.xs}>
          <Text variant="bodyMedium">{title}</Text>
          <Text colorToken="textSecondary" variant="bodySmall">
            {metadataLabel}
          </Text>
        </YStack>
        <StatusBadge label={status} tone={reservationStatusTones[status]} />
      </XStack>
    </Card>
  );
}
