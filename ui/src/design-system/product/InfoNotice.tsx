import type { LucideIcon } from 'lucide-react-native';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type InfoNoticeProps = {
  description: string;
  icon: LucideIcon;
  title?: string;
};

export function InfoNotice({ description, icon: Icon, title }: InfoNoticeProps) {
  return (
    <Card backgroundToken="surfaceSoft" borderRadius={radius.xl} gap={spacing.md} padding={spacing.xl}>
      <XStack alignItems="flex-start" gap={spacing.sm}>
        <Icon color={colors.accent} size={18} strokeWidth={1.9} />

        <YStack flex={1} gap={spacing.xs}>
          {title ? <Text variant="bodyMedium">{title}</Text> : null}
          <Text colorToken="textSecondary" variant="bodySmall">
            {description}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );
}
