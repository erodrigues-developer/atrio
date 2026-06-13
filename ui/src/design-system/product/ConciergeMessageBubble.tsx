import { MessageCircle } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { ConciergeMessage } from '@/src/mocks/concierge.mock';

type ConciergeMessageBubbleProps = {
  message: ConciergeMessage;
};

export function ConciergeMessageBubble({ message }: ConciergeMessageBubbleProps) {
  const isHotelMessage = message.sender === 'hotel';
  const bubble = (
    <YStack
      backgroundColor={isHotelMessage ? colors.surface : colors.accent}
      borderColor={isHotelMessage ? colors.borderSoft : 'transparent'}
      borderRadius={radius.xl}
      borderWidth={isHotelMessage ? 1 : 0}
      gap={spacing.xs}
      maxWidth="88%"
      paddingHorizontal={spacing.lg}
      paddingVertical={14}>
      <Text colorToken={isHotelMessage ? 'textPrimary' : 'textInverse'} variant="body">
        {message.text}
      </Text>
      {message.createdAtLabel ? (
        <Text colorToken={isHotelMessage ? 'textMuted' : 'textInverse'} opacity={0.72} variant="caption">
          {message.createdAtLabel}
        </Text>
      ) : null}
    </YStack>
  );

  if (!isHotelMessage) {
    return (
      <YStack alignItems="flex-end">
        {bubble}
      </YStack>
    );
  }

  return (
    <XStack alignItems="flex-end" gap={spacing.sm}>
      <YStack
        alignItems="center"
        backgroundColor={colors.surfaceSoft}
        borderColor={colors.borderSoft}
        borderRadius={radius.pill}
        borderWidth={1}
        height={34}
        justifyContent="center"
        width={34}>
        <MessageCircle color={colors.accent} size={16} strokeWidth={1.9} />
      </YStack>
      {bubble}
    </XStack>
  );
}
