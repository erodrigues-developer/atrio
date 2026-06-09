import { ChevronRight } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

export type StayContextBarProps = {
  checkOutTime: string;
  hotelName: string;
  onPress?: () => void;
  roomNumber: string;
};

export function StayContextBar({ checkOutTime, hotelName, onPress, roomNumber }: StayContextBarProps) {
  return (
    <XStack
      accessibilityRole={onPress ? 'button' : undefined}
      alignItems="center"
      borderBottomColor={colors.borderSoft}
      borderBottomWidth={1}
      onPress={onPress}
      paddingBottom={spacing.lg}
      paddingHorizontal={spacing.xxl}
      paddingTop={spacing.sm}
      pressStyle={
        onPress
          ? {
              opacity: 0.8,
            }
          : undefined
      }>
      <YStack flex={1} gap={2}>
        <Text variant="bodyMedium">{hotelName}</Text>
        <Text colorToken="textSecondary" variant="bodySmall">
          Quarto {roomNumber} · Check-out às {checkOutTime}
        </Text>
      </YStack>

      {onPress ? <ChevronRight color={colors.textMuted} size={16} strokeWidth={1.8} /> : null}
    </XStack>
  );
}
