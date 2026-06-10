import { ChevronLeft } from 'lucide-react-native';
import { XStack } from 'tamagui';

import { Button, type ButtonProps } from '@/src/design-system/components/Button';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type BackButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  accessibilityLabel: string;
  label?: string;
};

export function BackButton({ accessibilityLabel, label = 'Voltar', ...props }: BackButtonProps) {
  return (
    <Button
      accessibilityLabel={accessibilityLabel}
      alignSelf="flex-start"
      borderRadius={radius.pill}
      height={44}
      justifyContent="center"
      paddingHorizontal={label ? spacing.sm : 0}
      pressStyle={{
        backgroundColor: colors.surfaceSoft,
        opacity: 1,
      }}
      width={label ? undefined : 44}
      variant="ghost"
      {...props}>
      {label ? (
        <XStack alignItems="center" gap={spacing.xs}>
          <ChevronLeft color={colors.textSecondary} size={20} strokeWidth={1.9} />
          <Text colorToken="textSecondary" variant="bodySmall">
            {label}
          </Text>
        </XStack>
      ) : (
        <ChevronLeft color={colors.textSecondary} size={20} strokeWidth={1.9} />
      )}
    </Button>
  );
}
