import { XStack, YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';

type SectionHeaderProps = {
  actionLabel?: string;
  description?: string;
  onPressAction?: () => void;
  title: string;
};

export function SectionHeader({ actionLabel, description, onPressAction, title }: SectionHeaderProps) {
  return (
    <XStack alignItems="flex-start" gap={spacing.md} justifyContent="space-between">
      <YStack flex={1} gap={spacing.xs}>
        <Text variant="title3">{title}</Text>
        {description ? (
          <Text colorToken="textSecondary" variant="bodySmall">
            {description}
          </Text>
        ) : null}
      </YStack>

      {actionLabel && onPressAction ? (
        <Button alignSelf="flex-start" onPress={onPressAction} variant="ghost">
          <Text colorToken="accent" variant="caption">
            {actionLabel}
          </Text>
        </Button>
      ) : null}
    </XStack>
  );
}
