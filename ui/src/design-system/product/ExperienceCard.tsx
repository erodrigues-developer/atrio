import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type ExperienceCardProps = {
  badge?: string;
  category?: string;
  description?: string;
  imageSource?: ComponentProps<typeof Image>['source'];
  onPress?: () => void;
  priceLabel?: string;
  timeLabel?: string;
  title: string;
};

export function ExperienceCard({
  badge,
  category,
  description,
  imageSource,
  onPress,
  priceLabel,
  timeLabel,
  title,
}: ExperienceCardProps) {
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
      }}
      width={236}>
      {imageSource ? (
        <Image
          contentFit="cover"
          source={imageSource}
          style={{
            height: 132,
            width: '100%',
          }}
        />
      ) : null}

      <YStack gap={spacing.lg} padding={spacing.lg}>
        <YStack gap={spacing.md}>
          <XStack alignItems="center" flexWrap="wrap" gap={spacing.sm}>
            {badge ? (
              <XStack
                alignSelf="flex-start"
                backgroundColor={colors.accentSoft}
                borderColor={colors.borderSoft}
                borderRadius={radius.pill}
                borderWidth={1}
                paddingHorizontal={spacing.md}
                paddingVertical={6}>
                <Text colorToken="accent" variant="caption">
                  {badge}
                </Text>
              </XStack>
            ) : null}

            {category ? (
              <Text colorToken="textSecondary" variant="caption">
                {category}
              </Text>
            ) : null}
          </XStack>

          <YStack gap={spacing.sm}>
            <Text numberOfLines={2} variant="bodyMedium">
              {title}
            </Text>

            {description ? (
              <Text colorToken="textSecondary" numberOfLines={3} variant="bodySmall">
                {description}
              </Text>
            ) : null}
          </YStack>
        </YStack>

        <XStack alignItems="center" justifyContent="space-between" gap={spacing.md}>
          <YStack flex={1} gap={2}>
            {metadataLabel ? (
              <Text colorToken="textSecondary" numberOfLines={2} variant="caption">
                {metadataLabel}
              </Text>
            ) : null}
          </YStack>

          <ChevronRight color={colors.textMuted} size={16} strokeWidth={1.8} />
        </XStack>
      </YStack>
    </Card>
  );
}
