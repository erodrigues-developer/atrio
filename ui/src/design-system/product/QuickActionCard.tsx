import type { LucideIcon } from 'lucide-react-native';
import { YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type Props = {
  icon: LucideIcon;
  onPress?: () => void;
  title: string;
};

export function QuickActionCard({ icon: Icon, onPress, title }: Props) {
  return (
    <YStack
      accessibilityRole="button"
      alignItems="center"
      backgroundColor={colors.surface}
      borderColor={colors.borderSoft}
      borderRadius={radius.lg}
      borderWidth={1}
      gap={spacing.sm}
      justifyContent="center"
      minHeight={88}
      onPress={onPress}
      paddingHorizontal={13}
      paddingVertical={12}
      pressStyle={{
        backgroundColor: colors.surfaceSoft,
        borderColor: colors.border,
      }}
      width="48%">
      <YStack
        alignItems="center"
        backgroundColor={colors.surfaceSoft}
        borderRadius={radius.pill}
        height={34}
        justifyContent="center"
        width={34}>
        <Icon color={colors.accent} size={17} strokeWidth={1.9} />
      </YStack>

      <Text numberOfLines={1} textAlign="center" variant="bodySmall">
        {title}
      </Text>
    </YStack>
  );
}
