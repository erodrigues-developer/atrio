import { Button } from '@/src/design-system/components/Button';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';

type TimeSlotChipProps = {
  available?: boolean;
  onPress: () => void;
  selected?: boolean;
  time: string;
  width: number;
};

export function TimeSlotChip({
  available = true,
  onPress,
  selected = false,
  time,
  width,
}: TimeSlotChipProps) {
  const backgroundColor = !available ? colors.surfaceMuted : selected ? colors.accent : colors.surface;
  const borderColor = !available ? colors.borderSoft : selected ? colors.accent : colors.borderSoft;
  const textColor = !available ? 'textMuted' : selected ? 'textInverse' : 'textPrimary';

  return (
    <Button
      accessibilityLabel={`Horário ${time}`}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderRadius={radius.md}
      borderWidth={1}
      disabled={!available}
      justifyContent="center"
      onPress={onPress}
      pressStyle={{
        backgroundColor: selected ? colors.accentHover : colors.surfaceSoft,
        borderColor: selected ? colors.accentHover : colors.border,
      }}
      width={width}>
      <Text colorToken={textColor} variant="bodyMedium">
        {time}
      </Text>
    </Button>
  );
}
