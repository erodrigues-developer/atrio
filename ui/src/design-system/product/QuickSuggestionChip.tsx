import type { LucideIcon } from 'lucide-react-native';
import { XStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type QuickSuggestionChipProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

export function QuickSuggestionChip({ icon: Icon, label, onPress }: QuickSuggestionChipProps) {
  return (
    <Button
      accessibilityLabel={label}
      backgroundColor={colors.surface}
      borderColor={colors.borderSoft}
      borderRadius={radius.pill}
      borderWidth={1}
      height="auto"
      onPress={onPress}
      paddingHorizontal={spacing.lg}
      paddingVertical={11}
      pressStyle={{
        backgroundColor: colors.surfaceSoft,
        borderColor: colors.border,
      }}>
      <XStack alignItems="center" gap={spacing.sm}>
        <Icon color={colors.accent} size={16} strokeWidth={1.9} />
        <Text variant="bodySmall">{label}</Text>
      </XStack>
    </Button>
  );
}
