import { XStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type BadgeTone = 'accent' | 'danger' | 'gold' | 'success' | 'warning';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const toneStyles: Record<BadgeTone, { backgroundColor: string; colorToken: BadgeTone }> = {
  accent: {
    backgroundColor: colors.accentSoft,
    colorToken: 'accent',
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    colorToken: 'danger',
  },
  gold: {
    backgroundColor: colors.goldSoft,
    colorToken: 'gold',
  },
  success: {
    backgroundColor: colors.successSoft,
    colorToken: 'success',
  },
  warning: {
    backgroundColor: colors.warningSoft,
    colorToken: 'warning',
  },
};

export function Badge({ label, tone = 'accent' }: BadgeProps) {
  const toneStyle = toneStyles[tone];

  return (
    <XStack
      alignItems="center"
      backgroundColor={toneStyle.backgroundColor}
      borderColor={colors.borderSoft}
      borderRadius={radius.pill}
      borderWidth={1}
      paddingHorizontal={spacing.md}
      paddingVertical={6}>
      <Text colorToken={toneStyle.colorToken} variant="caption">
        {label}
      </Text>
    </XStack>
  );
}
