import { Button as TamaguiButton, type ButtonProps as TamaguiButtonProps } from 'tamagui';

import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';

type Variant = 'primary' | 'ghost';

type Props = Omit<TamaguiButtonProps, 'variant'> & {
  variant?: Variant;
};

const variantStyles: Record<Variant, TamaguiButtonProps> = {
  primary: {
    backgroundColor: colors.accent,
    color: colors.textInverse,
    height: 52,
    paddingHorizontal: 20,
    pressStyle: {
      backgroundColor: colors.accentHover,
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    height: 44,
    paddingHorizontal: 8,
    pressStyle: {
      opacity: 0.7,
    },
  },
};

export function Button({ children, variant = 'primary', ...props }: Props) {
  const styles = variantStyles[variant];

  return (
    <TamaguiButton
      unstyled
      alignItems="center"
      backgroundColor={styles.backgroundColor}
      borderRadius={radius.pill}
      color={styles.color}
      flexDirection="row"
      height={styles.height}
      justifyContent="center"
      paddingHorizontal={styles.paddingHorizontal}
      pressStyle={styles.pressStyle}
      {...props}>
      {children}
    </TamaguiButton>
  );
}
