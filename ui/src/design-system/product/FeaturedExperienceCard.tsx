import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type Props = {
  badge?: string;
  ctaLabel?: string;
  description: string;
  imageSource?: ComponentProps<typeof Image>['source'];
  onPress?: () => void;
  priceLabel?: string;
  timeLabel: string;
  title: string;
};

export function FeaturedExperienceCard({
  badge,
  ctaLabel = 'Ver detalhes',
  description,
  imageSource,
  onPress,
  priceLabel,
  timeLabel,
  title,
}: Props) {
  const metadataLabel = priceLabel ? `${timeLabel} · ${priceLabel}` : timeLabel;

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
            height: 156,
            width: '100%',
          }}
        />
      ) : null}

      <YStack gap={spacing.xxl} padding={spacing.xl}>
        <YStack gap={spacing.xl}>
          {badge ? (
            <XStack
              alignSelf="flex-start"
              backgroundColor={colors.surfaceSoft}
              borderColor={colors.borderSoft}
              borderRadius={radius.pill}
              borderWidth={1}
              paddingHorizontal={spacing.md}
              paddingVertical={6}>
              <Text colorToken="textSecondary" letterSpacing={0.2} textTransform="uppercase" variant="caption">
                {badge}
              </Text>
            </XStack>
          ) : null}

          <YStack gap={spacing.lg}>
            <Text letterSpacing={-0.3} variant="title3">
              {title}
            </Text>
            <Text colorToken="textSecondary" variant="body">
              {description}
            </Text>
          </YStack>
        </YStack>

        <YStack gap={spacing.lg}>
          <Text colorToken="textSecondary" variant="bodySmall">
            {metadataLabel}
          </Text>

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
