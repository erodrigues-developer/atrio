import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { featuredExperienceMock } from '../../../../src/mocks/experiences.mock';

export default function ExperienceDetailPlaceholderScreen() {
  const params = useLocalSearchParams<{ experienceId?: string | string[] }>();
  const experienceId = Array.isArray(params.experienceId) ? params.experienceId[0] : params.experienceId;
  const experienceTitle =
    experienceId === featuredExperienceMock.id ? featuredExperienceMock.title : 'Experiência selecionada';

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} gap={spacing.xxxl}>
        <Button
          accessibilityLabel="Voltar para Hoje"
          alignSelf="flex-start"
          borderRadius={radius.pill}
          height={44}
          justifyContent="center"
          onPress={() => router.back()}
          paddingHorizontal={0}
          pressStyle={{
            backgroundColor: colors.surfaceSoft,
            opacity: 1,
          }}
          width={44}
          variant="ghost">
          <ArrowLeft color={colors.textSecondary} size={20} strokeWidth={1.9} />
        </Button>

        <YStack gap={spacing.md}>
          <Text variant="title1">{experienceTitle}</Text>
          <Text colorToken="textSecondary" maxWidth="92%" variant="body">
            Esta área será expandida em uma próxima etapa com detalhes, horários e solicitação de reserva.
          </Text>
        </YStack>

        <Card borderRadius={radius.xl} gap={spacing.lg}>
          <Text variant="bodyMedium">{featuredExperienceMock.timeLabel}</Text>
          <Text colorToken="textSecondary" variant="body">
            {featuredExperienceMock.description}
          </Text>
          <Text colorToken="textSecondary" variant="bodySmall">
            {featuredExperienceMock.priceLabel}
          </Text>
        </Card>
      </YStack>
    </Screen>
  );
}
