import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type ReservationSummaryRow = {
  label: string;
  value: string;
};

type ReservationSummaryCardProps = {
  rows: ReservationSummaryRow[];
  title?: string;
};

export function ReservationSummaryCard({
  rows,
  title = 'Resumo',
}: ReservationSummaryCardProps) {
  return (
    <YStack gap={spacing.md}>
      <Text variant="title3">{title}</Text>
      <Card borderRadius={radius.xl} gap={spacing.lg} padding={spacing.xl}>
        {rows.map((row) => (
          <XStack alignItems="flex-start" justifyContent="space-between" key={row.label} gap={spacing.lg}>
            <Text colorToken="textSecondary" flex={1} variant="bodySmall">
              {row.label}
            </Text>
            <Text flex={1.4} textAlign="right" variant="bodyMedium">
              {row.value}
            </Text>
          </XStack>
        ))}
      </Card>
    </YStack>
  );
}
