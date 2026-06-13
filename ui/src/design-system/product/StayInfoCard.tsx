import type { LucideIcon } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type StayInfoCardProps = {
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
  title: string;
};

export function StayInfoCard({
  description,
  icon: Icon,
  isLast = false,
  title,
}: StayInfoCardProps) {
  return (
    <XStack
      alignItems="flex-start"
      borderBottomColor={isLast ? 'transparent' : colors.borderSoft}
      borderBottomWidth={isLast ? 0 : 1}
      gap={spacing.md}
      paddingVertical={spacing.lg}>
      <XStack
        alignItems="center"
        backgroundColor={colors.surfaceSoft}
        borderRadius={radius.pill}
        height={36}
        justifyContent="center"
        marginTop={2}
        width={36}>
        <Icon color={colors.textSecondary} size={18} strokeWidth={1.8} />
      </XStack>

      <YStack flex={1} gap={spacing.xs}>
        <Text variant="bodyMedium">{title}</Text>
        <Text colorToken="textSecondary" variant="bodySmall">
          {description}
        </Text>
      </YStack>
    </XStack>
  );
}
