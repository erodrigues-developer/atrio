import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { ReservationStatus } from '../../mocks/reservations.mock';

type Props = {
  status: ReservationStatus;
  timeLabel: string;
  title: string;
};

const statusStyles: Record<
  ReservationStatus,
  { backgroundColor: string; colorToken: 'danger' | 'success' | 'warning' }
> = {
  Confirmada: {
    backgroundColor: colors.successSoft,
    colorToken: 'success',
  },
  Pendente: {
    backgroundColor: colors.warningSoft,
    colorToken: 'warning',
  },
  'Precisa de atenção': {
    backgroundColor: colors.dangerSoft,
    colorToken: 'danger',
  },
};

export function ReservationCard({ status, timeLabel, title }: Props) {
  const statusStyle = statusStyles[status];

  return (
    <Card gap={spacing.lg} padding={spacing.lg}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap={spacing.md}>
        <YStack flex={1} gap={spacing.xs}>
          <Text variant="bodyMedium">{title}</Text>
          <Text colorToken="textSecondary" variant="bodySmall">
            {timeLabel}
          </Text>
        </YStack>
        <XStack
          alignSelf="flex-start"
          backgroundColor={statusStyle.backgroundColor}
          borderColor={colors.borderSoft}
          borderRadius={radius.pill}
          borderWidth={1}
          paddingHorizontal={spacing.md}
          paddingVertical={6}>
          <Text colorToken={statusStyle.colorToken} variant="caption">
            {status}
          </Text>
        </XStack>
      </XStack>
    </Card>
  );
}
