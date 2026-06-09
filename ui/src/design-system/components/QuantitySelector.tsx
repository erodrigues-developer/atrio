import { Minus, Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { XStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

export type QuantitySelectorProps = {
  disabled?: boolean;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
};

type StepButtonProps = {
  accessibilityLabel: string;
  direction: 'decrease' | 'increase';
  disabled: boolean;
  onPress: () => void;
};

function StepButton({ accessibilityLabel, direction, disabled, onPress }: StepButtonProps) {
  const Icon = direction === 'decrease' ? Minus : Plus;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: colors.accentSoft,
        borderRadius: radius.pill,
        height: 44,
        justifyContent: 'center',
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        width: 44,
      })}>
      <Icon color={colors.accent} size={18} strokeWidth={2} />
    </Pressable>
  );
}

export function QuantitySelector({
  disabled = false,
  max = 10,
  min = 1,
  onChange,
  value,
}: QuantitySelectorProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <XStack
      alignItems="center"
      backgroundColor={colors.surface}
      borderColor={colors.borderSoft}
      borderRadius={radius.xl}
      borderWidth={1}
      justifyContent="space-between"
      padding={spacing.lg}>
      <StepButton
        accessibilityLabel="Diminuir quantidade"
        direction="decrease"
        disabled={!canDecrease}
        onPress={() => onChange(Math.max(min, value - 1))}
      />

      <Text letterSpacing={-0.8} variant="display">
        {value}
      </Text>

      <StepButton
        accessibilityLabel="Aumentar quantidade"
        direction="increase"
        disabled={!canIncrease}
        onPress={() => onChange(Math.min(max, value + 1))}
      />
    </XStack>
  );
}
