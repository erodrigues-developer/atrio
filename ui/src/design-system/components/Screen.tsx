import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, type YStackProps } from 'tamagui';

import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

type Props = YStackProps & {
  children: ReactNode;
};

export function Screen({ children, ...props }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <YStack
        backgroundColor={colors.background}
        flex={1}
        paddingHorizontal={spacing.xxl}
        paddingTop={spacing.lg}
        paddingBottom={spacing.xxl}
        {...props}>
        {children}
      </YStack>
    </SafeAreaView>
  );
}
