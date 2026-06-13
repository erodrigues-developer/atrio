import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type EmptyStateProps = {
  actionLabel?: string;
  description: string;
  onActionPress?: () => void;
  onSecondaryActionPress?: () => void;
  secondaryActionLabel?: string;
  title: string;
};

export function EmptyState({
  actionLabel,
  description,
  onActionPress,
  onSecondaryActionPress,
  secondaryActionLabel,
  title,
}: EmptyStateProps) {
  return (
    <Card alignItems="center" borderRadius={radius.xl} gap={spacing.lg} padding={spacing.xl}>
      <YStack alignItems="center" gap={spacing.xs}>
        <Text textAlign="center" variant="bodyMedium">
          {title}
        </Text>
        <Text colorToken="textSecondary" maxWidth="92%" textAlign="center" variant="bodySmall">
          {description}
        </Text>
      </YStack>

      {actionLabel && onActionPress ? (
        <Button onPress={onActionPress}>
          <Text colorToken="textInverse" variant="bodyMedium">
            {actionLabel}
          </Text>
        </Button>
      ) : null}

      {secondaryActionLabel && onSecondaryActionPress ? (
        <Button onPress={onSecondaryActionPress} variant="ghost">
          <Text colorToken="textSecondary" variant="bodyMedium">
            {secondaryActionLabel}
          </Text>
        </Button>
      ) : null}
    </Card>
  );
}
