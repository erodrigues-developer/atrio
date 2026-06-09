import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { spacing } from '@/src/design-system/tokens/spacing';

export default function VerifySmsScreen() {
  return (
    <Screen>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap={spacing.xxxl}>
          <Button
            accessibilityLabel="Voltar para identificação da estadia"
            alignSelf="flex-start"
            minHeight={44}
            onPress={() => router.replace('/(onboarding)/identify-stay')}
            variant="ghost">
            <MaterialIcons color={colors.textSecondary} name="chevron-left" size={24} />
          </Button>

          <YStack gap={spacing.md}>
            <Text maxWidth="88%" variant="title1">
              Confirmação por SMS
            </Text>
            <Text colorToken="textSecondary" maxWidth="94%" variant="body">
              Enviamos um código para o telefone vinculado à sua reserva.
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </Screen>
  );
}
