import { Text as TamaguiText, TextProps as TamaguiTextProps } from 'tamagui';

import { colors, type ColorToken } from '@/src/design-system/tokens/colors';
import { typography, type TypographyToken } from '@/src/design-system/tokens/typography';

type Props = TamaguiTextProps & {
  colorToken?: ColorToken;
  variant?: TypographyToken;
};

export function Text({
  children,
  colorToken = 'textPrimary',
  variant = 'body',
  ...props
}: Props) {
  const textStyle = typography[variant];

  return (
    <TamaguiText color={colors[colorToken]} {...textStyle} {...props}>
      {children}
    </TamaguiText>
  );
}
