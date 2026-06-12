import { Check } from 'lucide-react-native';
import { XStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

type IncludedItemProps = {
  label: string;
};

export function IncludedItem({ label }: IncludedItemProps) {
  return (
    <XStack alignItems="flex-start" gap={spacing.md}>
      <Check color={colors.accent} size={16} strokeWidth={2} style={{ marginTop: 3 }} />
      <Text flex={1} variant="body">
        {label}
      </Text>
    </XStack>
  );
}
