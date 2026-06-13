import type { LucideIcon } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

type ConsumptionItemProps = {
  amountLabel: string;
  dateLabel: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
  title: string;
};

export function ConsumptionItem({
  amountLabel,
  dateLabel,
  description,
  icon: Icon,
  isLast = false,
  title,
}: ConsumptionItemProps) {
  return (
    <XStack
      borderBottomColor={isLast ? 'transparent' : colors.borderSoft}
      borderBottomWidth={isLast ? 0 : 1}
      gap={spacing.md}
      paddingVertical={spacing.lg}>
      <XStack alignItems="center" justifyContent="center" paddingTop={2} width={22}>
        <Icon color={colors.textSecondary} size={18} strokeWidth={1.9} />
      </XStack>

      <XStack alignItems="flex-start" flex={1} gap={spacing.md} justifyContent="space-between">
        <YStack flex={1} gap={spacing.xs}>
          <Text variant="bodyMedium">{title}</Text>
          <Text colorToken="textSecondary" variant="bodySmall">
            {description}
          </Text>
          <Text colorToken="textSecondary" variant="caption">
            {dateLabel}
          </Text>
        </YStack>

        <Text textAlign="right" variant="bodyMedium">
          {amountLabel}
        </Text>
      </XStack>
    </XStack>
  );
}
