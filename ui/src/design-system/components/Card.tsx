import { YStack, type YStackProps } from 'tamagui';

import { colors, type ColorToken } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type Props = YStackProps & {
  backgroundToken?: ColorToken;
};

export function Card({ backgroundToken = 'surface', children, ...props }: Props) {
  return (
    <YStack
      backgroundColor={colors[backgroundToken]}
      borderColor={colors.borderSoft}
      borderWidth={1}
      borderRadius={radius.lg}
      padding={spacing.xl}
      {...props}>
      {children}
    </YStack>
  );
}
