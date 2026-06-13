import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { StatusBadge } from '@/src/design-system/components/StatusBadge';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type StayNavigationItemProps = {
  description: string;
  icon: LucideIcon;
  onPress: () => void;
  summaryLabel?: string;
  title: string;
};

export function StayNavigationItem({
  description,
  icon: Icon,
  onPress,
  summaryLabel,
  title,
}: StayNavigationItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.xl,
        opacity: pressed ? 0.88 : 1,
      })}>
      <Card borderRadius={radius.xl} gap={spacing.lg} padding={spacing.xl}>
        <XStack alignItems="flex-start" gap={spacing.md}>
          <XStack
            alignItems="center"
            backgroundColor={colors.surfaceSoft}
            borderRadius={radius.pill}
            height={40}
            justifyContent="center"
            marginTop={2}
            width={40}>
            <Icon color={colors.accent} size={18} strokeWidth={1.9} />
          </XStack>

          <XStack alignItems="flex-start" flex={1} gap={spacing.md} justifyContent="space-between">
            <YStack flex={1} gap={spacing.sm}>
              <YStack gap={spacing.xs}>
                <Text variant="bodyMedium">{title}</Text>
                <Text colorToken="textSecondary" variant="bodySmall">
                  {description}
                </Text>
              </YStack>

              {summaryLabel ? <StatusBadge label={summaryLabel} tone="muted" /> : null}
            </YStack>

            <ChevronRight color={colors.textMuted} size={18} strokeWidth={1.8} />
          </XStack>
        </XStack>
      </Card>
    </Pressable>
  );
}
