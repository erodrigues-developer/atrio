import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type DateOptionChipProps = {
  dateLabel: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
};

export function DateOptionChip({ dateLabel, label, onPress, selected = false }: DateOptionChipProps) {
  return (
    <Button
      accessibilityLabel={`${label}, ${dateLabel}`}
      backgroundColor={selected ? colors.accent : colors.surface}
      borderColor={selected ? colors.accent : colors.borderSoft}
      borderRadius={radius.lg}
      borderWidth={1}
      height="auto"
      minWidth={96}
      onPress={onPress}
      paddingHorizontal={spacing.lg}
      paddingVertical={spacing.md}
      pressStyle={{
        backgroundColor: selected ? colors.accentHover : colors.surfaceSoft,
        borderColor: selected ? colors.accentHover : colors.border,
      }}>
      <YStack alignItems="flex-start" gap={2}>
        <Text colorToken={selected ? 'textInverse' : 'textPrimary'} variant="bodyMedium">
          {label}
        </Text>
        <Text colorToken={selected ? 'textInverse' : 'textSecondary'} variant="bodySmall">
          {dateLabel}
        </Text>
      </YStack>
    </Button>
  );
}
