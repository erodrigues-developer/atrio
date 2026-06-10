import { ChevronLeft } from 'lucide-react-native';

import { Button, type ButtonProps } from '@/src/design-system/components/Button';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';

type BackButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  accessibilityLabel: string;
};

export function BackButton({ accessibilityLabel, ...props }: BackButtonProps) {
  return (
    <Button
      accessibilityLabel={accessibilityLabel}
      alignSelf="flex-start"
      borderRadius={radius.pill}
      height={44}
      justifyContent="center"
      paddingHorizontal={0}
      pressStyle={{
        backgroundColor: colors.surfaceSoft,
        opacity: 1,
      }}
      width={44}
      variant="ghost"
      {...props}>
      <ChevronLeft color={colors.textSecondary} size={20} strokeWidth={1.9} />
    </Button>
  );
}
