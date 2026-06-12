import { Image } from 'expo-image';
import { ChevronLeft } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type ExperienceDetailHeroProps = {
  imageSource?: ComponentProps<typeof Image>['source'];
  onPressBack: () => void;
};

export function ExperienceDetailHero({ imageSource, onPressBack }: ExperienceDetailHeroProps) {
  return (
    <YStack height={248} overflow="hidden" position="relative">
      {imageSource ? (
        <Image
          contentFit="cover"
          source={imageSource}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
      ) : (
        <YStack backgroundColor={colors.surfaceSoft} flex={1} />
      )}

      <Button
        accessibilityLabel="Voltar"
        alignItems="center"
        backgroundColor="rgba(255, 255, 255, 0.88)"
        borderColor={colors.borderSoft}
        borderRadius={radius.pill}
        borderWidth={1}
        height={44}
        justifyContent="center"
        left={spacing.xxl}
        onPress={onPressBack}
        paddingHorizontal={0}
        position="absolute"
        pressStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
        }}
        top={spacing.lg}
        width={44}>
        <ChevronLeft color={colors.textPrimary} size={20} strokeWidth={1.9} />
      </Button>
    </YStack>
  );
}
