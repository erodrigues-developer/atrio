import { Building2, Clock } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { StatusBadge } from '@/src/design-system/components/StatusBadge';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { StayMock } from '@/src/mocks/stay.mock';

function StayDetailColumn({ label, value }: { label: string; value: string }) {
  return (
    <YStack flex={1} gap={spacing.xs}>
      <Text colorToken="textSecondary" variant="caption">
        {label}
      </Text>
      <Text variant="bodyMedium">{value}</Text>
    </YStack>
  );
}

export function StaySummaryCard({ stay }: { stay: StayMock }) {
  return (
    <Card borderRadius={radius.xl} gap={spacing.xl} padding={spacing.xl}>
      <XStack alignItems="flex-start" gap={spacing.md}>
        <XStack
          alignItems="center"
          backgroundColor={colors.accentSoft}
          borderRadius={radius.pill}
          height={44}
          justifyContent="center"
          width={44}>
          <Building2 color={colors.accent} size={20} strokeWidth={1.9} />
        </XStack>

        <YStack flex={1} gap={spacing.sm}>
          <YStack gap={2}>
            <Text variant="title3">{stay.hotelName}</Text>
            <Text colorToken="textSecondary" variant="body">
              Quarto {stay.roomNumber}
            </Text>
          </YStack>

          <StatusBadge label={stay.statusLabel} tone="accent" />
        </YStack>
      </XStack>

      <YStack borderTopColor={colors.borderSoft} borderTopWidth={1} gap={spacing.lg} paddingTop={spacing.lg}>
        <XStack gap={spacing.lg}>
          <StayDetailColumn label="Check-in" value={`${stay.checkInLabel}, a partir das ${stay.checkInTimeLabel}`} />
          <StayDetailColumn
            label="Check-out"
            value={`${stay.checkOutLabel}, até ${stay.checkOutTimeLabel}`}
          />
        </XStack>

        <XStack
          alignItems="center"
          backgroundColor={colors.surfaceSoft}
          borderColor={colors.borderSoft}
          borderRadius={radius.md}
          borderWidth={1}
          gap={spacing.sm}
          paddingHorizontal={spacing.md}
          paddingVertical={spacing.md}>
          <Clock color={colors.accent} size={18} strokeWidth={1.9} />
          <Text colorToken="accent" variant="bodySmall">
            Check-out até {stay.checkOutTimeLabel}
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
}
