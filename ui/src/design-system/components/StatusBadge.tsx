import { XStack } from 'tamagui';

import type { RequestStatusType } from '@/src/mocks/requests.mock';
import { Text } from '@/src/design-system/components/Text';
import { colors, type ColorToken } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

export type StatusBadgeTone = 'accent' | 'success' | 'warning' | 'muted' | 'danger';

type StatusBadgeProps = {
  label: string;
  status?: RequestStatusType;
  tone?: StatusBadgeTone;
};

const toneStyles: Record<StatusBadgeTone, { backgroundColor: string; colorToken: ColorToken }> = {
  accent: {
    backgroundColor: colors.accentSoft,
    colorToken: 'accent',
  },
  success: {
    backgroundColor: colors.successSoft,
    colorToken: 'success',
  },
  warning: {
    backgroundColor: colors.warningSoft,
    colorToken: 'warning',
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    colorToken: 'textSecondary',
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    colorToken: 'danger',
  },
};

const requestStatusTones: Record<RequestStatusType, StatusBadgeTone> = {
  received: 'accent',
  preparing: 'warning',
  on_the_way: 'accent',
  completed: 'success',
  attention: 'danger',
};

export function StatusBadge({ label, status, tone }: StatusBadgeProps) {
  const resolvedTone = tone ?? (status ? requestStatusTones[status] : 'accent');
  const statusStyle = toneStyles[resolvedTone];

  return (
    <XStack
      alignItems="center"
      alignSelf="flex-start"
      backgroundColor={statusStyle.backgroundColor}
      borderColor={colors.borderSoft}
      borderRadius={radius.pill}
      borderWidth={1}
      paddingHorizontal={spacing.md}
      paddingVertical={6}>
      <Text colorToken={statusStyle.colorToken} variant="caption">
        {label}
      </Text>
    </XStack>
  );
}
