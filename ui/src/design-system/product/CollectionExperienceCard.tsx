import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { EditorialBadge } from '@/src/design-system/components/EditorialBadge';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type CollectionExperienceCardProps = {
  badge?: string;
  ctaLabel?: string;
  description: string;
  imageSource?: ComponentProps<typeof Image>['source'];
  onPress?: () => void;
  priceLabel?: string;
  timeLabel?: string;
  title: string;
};

function getBadgeTone(badge?: string) {
  if (!badge) {
    return 'accent' as const;
  }

  if (
    badge.includes('Mais reservada') ||
    badge.includes('Selecionado pelo hotel') ||
    badge.includes('Exclusivo do hotel')
  ) {
    return 'gold' as const;
  }

  return 'accent' as const;
}

export function CollectionExperienceCard({
  badge,
  ctaLabel = 'Ver detalhes',
  description,
  imageSource,
  onPress,
  priceLabel,
  timeLabel,
  title,
}: CollectionExperienceCardProps) {
  const metadataLabel = [timeLabel, priceLabel].filter(Boolean).join(' · ');

  return (
    <Card
      accessibilityRole="button"
      borderRadius={radius.xl}
      onPress={onPress}
      overflow="hidden"
      padding={0}
      pressStyle={{
        backgroundColor: colors.surfaceSoft,
        borderColor: colors.border,
      }}>
      {imageSource ? (
        <Image
          contentFit="cover"
          source={imageSource}
          style={{
            height: 168,
            width: '100%',
          }}
        />
      ) : null}

      <YStack gap={spacing.xl} padding={spacing.xl}>
        <YStack gap={spacing.lg}>
          {badge ? <EditorialBadge label={badge} tone={getBadgeTone(badge)} /> : null}

          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.3} variant="title3">
              {title}
            </Text>
            <Text colorToken="textSecondary" variant="bodySmall">
              {description}
            </Text>
          </YStack>
        </YStack>

        <YStack gap={spacing.md}>
          {metadataLabel ? (
            <Text colorToken="textSecondary" variant="bodySmall">
              {metadataLabel}
            </Text>
          ) : null}

          <XStack alignItems="center" gap={spacing.xs}>
            <Text colorToken="accent" variant="bodyMedium">
              {ctaLabel}
            </Text>
            <ChevronRight color={colors.accent} size={16} strokeWidth={1.8} />
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}
