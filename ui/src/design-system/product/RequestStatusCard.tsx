import { ChevronRight } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { StatusBadge } from '@/src/design-system/components/StatusBadge';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { RequestStatus, RequestStatusType } from '../../mocks/requests.mock';

type Props = {
  details?: string[];
  onPress?: () => void;
  status: RequestStatus;
  statusType: RequestStatusType;
  timeLabel: string;
  title: string;
};

export function RequestStatusCard({ details, onPress, status, statusType, timeLabel, title }: Props) {
  const detailLines = details?.length ? details : [timeLabel];

  const cardContent = (
    <Card borderRadius={radius.xl} gap={spacing.lg} padding={spacing.xl}>
      <XStack alignItems="flex-start" justifyContent="space-between" gap={spacing.md}>
        <Text flex={1} variant="bodyMedium">
          {title}
        </Text>

        <XStack alignItems="center" gap={spacing.sm}>
          <StatusBadge label={status} status={statusType} />
          {onPress ? <ChevronRight color={colors.textMuted} size={18} strokeWidth={1.9} /> : null}
        </XStack>
      </XStack>

      <YStack gap={spacing.xs}>
        {detailLines.map((detail) => (
          <Text key={detail} colorToken="textSecondary" variant="bodySmall">
            {detail}
          </Text>
        ))}
      </YStack>
    </Card>
  );

  if (!onPress) {
    return cardContent;
  }

  return (
    <Pressable
      accessibilityLabel={`Abrir solicitações com ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.xl,
        opacity: pressed ? 0.88 : 1,
      })}>
      {cardContent}
    </Pressable>
  );
}
