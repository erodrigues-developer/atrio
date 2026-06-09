import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { typography } from '@/src/design-system/tokens/typography';

type Props = TextInputProps & {
  disabled?: boolean;
};

export const TextArea = forwardRef<TextInput, Props>(function TextArea(
  { disabled = false, editable, style, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      editable={editable ?? !disabled}
      multiline
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.accent}
      style={[
        typography.body,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          borderWidth: 1,
          color: colors.textPrimary,
          minHeight: 104,
          opacity: disabled ? 0.6 : 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          textAlignVertical: 'top',
        },
        style,
      ]}
      {...props}
    />
  );
});
