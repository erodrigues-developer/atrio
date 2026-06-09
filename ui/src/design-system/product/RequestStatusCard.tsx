import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { RequestStatus } from '../../mocks/requests.mock';

type Props = {
  status: RequestStatus;
  timeLabel: string;
  title: string;
};

const statusStyles: Record<
  RequestStatus,
  { backgroundColor: string; colorToken: 'accent' | 'danger' | 'success' | 'warning' }
> = {
    Recebido: {
      backgroundColor: colors.warningSoft,
      colorToken: 'warning',
    },
    'Em preparo': {
      backgroundColor: colors.warningSoft,
      colorToken: 'warning',
    },
    'A caminho': {
      backgroundColor: colors.accentSoft,
      colorToken: 'accent',
    },
    Concluído: {
      backgroundColor: colors.successSoft,
      colorToken: 'success',
    },
    'Precisa de atenção': {
      backgroundColor: colors.dangerSoft,
      colorToken: 'danger',
    },
  };

export function RequestStatusCard({ status, timeLabel, title }: Props) {
  const statusStyle = statusStyles[status];

  return (
    <Card gap={spacing.lg} padding={spacing.lg}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap={spacing.md}>
        <Text flex={1} variant="bodyMedium">
          {title}
        </Text>
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

      <YStack gap={spacing.xs}>
        <Text colorToken="textSecondary" variant="bodySmall">
          {timeLabel}
        </Text>
      </YStack>
    </Card>
  );
}
