import { Copy, Wifi } from 'lucide-react-native';
import { Alert } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { goBackOrReplace } from '@/src/navigation/go-back';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { stayMock } from '@/src/mocks/stay.mock';

export default function WifiScreen() {
  const handleCopyPassword = () => {
    Alert.alert('Senha pronta', 'Use a senha exibida abaixo para conectar seus dispositivos.');
  };

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} gap={spacing.xxxl}>
        <BackButton accessibilityLabel="Voltar" onPress={() => goBackOrReplace('/(guest)/stay')} />

        <YStack gap={spacing.md}>
          <Text variant="title1">Wi-Fi</Text>
          <Text colorToken="textSecondary" maxWidth="92%" variant="body">
            As informações de conexão da sua estadia estão prontas por aqui.
          </Text>
        </YStack>

        <Card borderRadius={radius.xl} gap={spacing.xl}>
          <XStack alignItems="center" gap={spacing.md}>
            <XStack
              alignItems="center"
              backgroundColor={colors.surfaceSoft}
              borderRadius={radius.pill}
              height={40}
              justifyContent="center"
              width={40}>
              <Wifi color={colors.accent} size={18} strokeWidth={1.9} />
            </XStack>
            <YStack gap={spacing.xs}>
              <Text variant="bodyMedium">{stayMock.wifi.network}</Text>
              <Text colorToken="textSecondary" variant="bodySmall">
                Rede principal do hotel
              </Text>
            </YStack>
          </XStack>

          <YStack gap={spacing.sm}>
            <Text colorToken="textSecondary" variant="bodySmall">
              Senha
            </Text>
            <Text variant="title3">{stayMock.wifi.password}</Text>
          </YStack>

          <Button alignSelf="flex-start" minHeight={44} onPress={handleCopyPassword} variant="ghost">
            <XStack alignItems="center" gap={spacing.sm}>
              <Copy color={colors.accent} size={16} strokeWidth={1.9} />
              <Text colorToken="accent" variant="bodySmall">
                Ver novamente
              </Text>
            </XStack>
          </Button>
        </Card>
      </YStack>
    </Screen>
  );
}
