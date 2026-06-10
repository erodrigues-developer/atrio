import { XStack } from 'tamagui';

import type { RequestStatusType } from '@/src/mocks/requests.mock';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type StatusBadgeProps = {
  label: string;
  status: RequestStatusType;
};

const statusStyles: Record<
  RequestStatusType,
  { backgroundColor: string; colorToken: 'accent' | 'danger' | 'success' | 'warning' }
> = {
  received: {
    backgroundColor: colors.accentSoft,
    colorToken: 'accent',
  },
  preparing: {
    backgroundColor: colors.warningSoft,
    colorToken: 'warning',
  },
  on_the_way: {
    backgroundColor: colors.accentSoft,
    colorToken: 'accent',
  },
  completed: {
    backgroundColor: colors.successSoft,
    colorToken: 'success',
  },
  attention: {
    backgroundColor: colors.dangerSoft,
    colorToken: 'danger',
  },
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const statusStyle = statusStyles[status];

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
