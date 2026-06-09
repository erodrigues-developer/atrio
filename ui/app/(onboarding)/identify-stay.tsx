import { ArrowRight, Hotel } from 'lucide-react-native';
import { YStack, XStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

export default function IdentifyStayScreen() {
  return (
    <Screen>
      <YStack flex={1} gap={spacing.xxxl} justifyContent="center">
        <YStack gap={spacing.md}>
          <Text maxWidth="84%" variant="title2">
            Identificação da estadia
          </Text>
          <Text colorToken="textSecondary" maxWidth="92%" variant="body">
            Na próxima etapa, você informará o número do quarto e o sobrenome para acessar sua estadia.
          </Text>
        </YStack>

        <Card>
          <XStack alignItems="center" gap={spacing.md}>
            <YStack
              alignItems="center"
              backgroundColor={colors.surfaceSoft}
              borderRadius={radius.pill}
              justifyContent="center"
              padding={spacing.md}>
              <Hotel color={colors.accent} size={18} strokeWidth={1.9} />
            </YStack>
            <YStack flex={1} gap={spacing.xs}>
              <Text variant="bodyMedium">Próxima tela em construção</Text>
              <Text colorToken="textSecondary" variant="bodySmall">
                Vamos preparar esse fluxo completo na próxima task, mantendo o mesmo padrão visual da recepção digital.
              </Text>
            </YStack>
            <ArrowRight color={colors.textMuted} size={18} strokeWidth={1.8} />
          </XStack>
        </Card>
      </YStack>
    </Screen>
  );
}
