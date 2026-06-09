import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, type YStackProps } from 'tamagui';

import { DismissKeyboardView } from '@/src/design-system/components/DismissKeyboardView';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

type Props = YStackProps & {
  children: ReactNode;
  dismissKeyboardOnPressOutside?: boolean;
};

export function Screen({ children, dismissKeyboardOnPressOutside = false, ...props }: Props) {
  const content = (
    <YStack
      backgroundColor={colors.background}
      flex={1}
      paddingHorizontal={spacing.xxl}
      paddingTop={spacing.lg}
      paddingBottom={spacing.xxl}
      {...props}>
      {children}
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {dismissKeyboardOnPressOutside ? <DismissKeyboardView>{content}</DismissKeyboardView> : content}
    </SafeAreaView>
  );
}
