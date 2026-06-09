import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

export type ServiceListItemProps = {
  description: string;
  icon: ReactNode;
  isLast?: boolean;
  onPress?: () => void;
  title: string;
};

export function ServiceListItem({
  description,
  icon,
  isLast = false,
  onPress,
  title,
}: ServiceListItemProps) {
  return (
    <XStack
      accessibilityRole="button"
      alignItems="center"
      borderBottomColor={isLast ? 'transparent' : colors.borderSoft}
      borderBottomWidth={isLast ? 0 : 1}
      gap={spacing.md}
      onPress={onPress}
      paddingVertical={18}
      pressStyle={{
        opacity: 0.72,
      }}>
      <XStack
        alignItems="center"
        backgroundColor={colors.surfaceSoft}
        borderColor={colors.borderSoft}
        borderRadius={radius.pill}
        borderWidth={1}
        height={36}
        justifyContent="center"
        width={36}>
        {icon}
      </XStack>

      <YStack flex={1} gap={2}>
        <Text variant="bodyMedium">{title}</Text>
        <Text colorToken="textSecondary" variant="bodySmall">
          {description}
        </Text>
      </YStack>

      <ChevronRight color={colors.textMuted} size={16} strokeWidth={1.8} />
    </XStack>
  );
}
