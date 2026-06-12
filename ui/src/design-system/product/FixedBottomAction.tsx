import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

type FixedBottomActionProps = {
  bottomSpacing?: number;
  label: string;
  onPress: () => void;
};

export function FixedBottomAction({ bottomSpacing = 0, label, onPress }: FixedBottomActionProps) {
  return (
    <YStack
      backgroundColor="rgba(250, 248, 244, 0.96)"
      borderTopColor={colors.borderSoft}
      borderTopWidth={1}
      paddingBottom={bottomSpacing + spacing.lg}
      paddingHorizontal={spacing.xxl}
      paddingTop={spacing.lg}
      width="100%">
      <Button onPress={onPress}>
        <Text colorToken="textInverse" variant="bodyMedium">
          {label}
        </Text>
      </Button>
    </YStack>
  );
}
