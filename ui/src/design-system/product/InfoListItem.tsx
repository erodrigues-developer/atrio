import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

type Props = {
  description?: string;
  icon: LucideIcon;
  isLast?: boolean;
  onPress?: () => void;
  title: string;
};

export function InfoListItem({ description, icon: Icon, isLast = false, onPress, title }: Props) {
  return (
    <XStack
      accessibilityRole="button"
      alignItems="center"
      borderBottomColor={isLast ? 'transparent' : colors.borderSoft}
      borderBottomWidth={isLast ? 0 : 1}
      gap={spacing.md}
      onPress={onPress}
      paddingVertical={spacing.lg}
      pressStyle={{
        opacity: 0.72,
      }}>
      <XStack alignItems="center" justifyContent="center" width={22}>
        <Icon color={colors.textSecondary} size={18} strokeWidth={1.9} />
      </XStack>

      <YStack flex={1} gap={2}>
        <Text variant="bodyMedium">{title}</Text>
        {description ? (
          <Text colorToken="textSecondary" variant="bodySmall">
            {description}
          </Text>
        ) : null}
      </YStack>

      <ChevronRight color={colors.textMuted} size={16} strokeWidth={1.8} />
    </XStack>
  );
}
