import { XStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type EditorialBadgeTone = 'accent' | 'gold';

type EditorialBadgeProps = {
  label: string;
  tone?: EditorialBadgeTone;
};

const badgeStyles: Record<
  EditorialBadgeTone,
  {
    backgroundColor: string;
    colorToken: 'accent' | 'gold' | 'textSecondary';
  }
> = {
  accent: {
    backgroundColor: colors.accentSoft,
    colorToken: 'accent',
  },
  gold: {
    backgroundColor: colors.goldSoft,
    colorToken: 'gold',
  },
};

export function EditorialBadge({ label, tone = 'accent' }: EditorialBadgeProps) {
  const style = badgeStyles[tone];

  return (
    <XStack
      alignItems="center"
      alignSelf="flex-start"
      backgroundColor={style.backgroundColor}
      borderColor={colors.borderSoft}
      borderRadius={radius.pill}
      borderWidth={1}
      paddingHorizontal={spacing.md}
      paddingVertical={6}>
      <Text colorToken={style.colorToken} variant="caption">
        {label}
      </Text>
    </XStack>
  );
}
