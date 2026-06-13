import { YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type ConsumptionSummaryCardProps = {
  itemCountLabel: string;
  totalLabel: string;
  updatedAtLabel?: string;
};

export function ConsumptionSummaryCard({
  itemCountLabel,
  totalLabel,
  updatedAtLabel,
}: ConsumptionSummaryCardProps) {
  return (
    <Card borderRadius={radius.xl} gap={spacing.md} padding={spacing.xl}>
      <YStack gap={spacing.xs}>
        <Text colorToken="textSecondary" variant="caption">
          Total parcial
        </Text>
        <Text letterSpacing={-0.4} variant="title1">
          {totalLabel}
        </Text>
      </YStack>

      <YStack gap={2}>
        <Text variant="bodyMedium">{itemCountLabel}</Text>
        {updatedAtLabel ? (
          <Text colorToken="textSecondary" variant="bodySmall">
            {updatedAtLabel}
          </Text>
        ) : null}
      </YStack>
    </Card>
  );
}
