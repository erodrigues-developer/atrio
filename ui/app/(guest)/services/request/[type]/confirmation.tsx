import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';
import { YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { useRequests } from '@/src/stores/requests.store';

export default function ServiceRequestConfirmationScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const requests = useRequests();
  const latestRequest = requests.find((request) => request.type === type);

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap={spacing.xxl} paddingTop={spacing.huge}>
          <YStack alignItems="center" gap={spacing.lg}>
            <YStack
              alignItems="center"
              backgroundColor={colors.accentSoft}
              borderRadius={radius.pill}
              height={72}
              justifyContent="center"
              width={72}>
              <CircleCheckBig color={colors.accent} size={30} strokeWidth={1.9} />
            </YStack>

            <YStack alignItems="center" gap={spacing.sm}>
              <Text textAlign="center" variant="title2">
                Solicitação recebida
              </Text>
              <Text colorToken="textSecondary" maxWidth="88%" textAlign="center" variant="body">
                Nossa equipe já foi notificada e acompanhará seu pedido.
              </Text>
            </YStack>
          </YStack>

          {latestRequest ? (
            <Card backgroundToken="surfaceSoft" gap={spacing.sm} padding={spacing.xl}>
              <Text variant="bodyMedium">{latestRequest.title}</Text>
              <Text colorToken="textSecondary" variant="bodySmall">
                Quarto {latestRequest.roomNumber}
              </Text>
              {latestRequest.quantity ? (
                <Text colorToken="textSecondary" variant="bodySmall">
                  Quantidade: {latestRequest.quantity}
                </Text>
              ) : null}
              <Text colorToken="textSecondary" variant="bodySmall">
                {latestRequest.timeLabel}
              </Text>
            </Card>
          ) : null}
        </YStack>

        <YStack gap={spacing.sm}>
          <Button onPress={() => router.replace('/(guest)/stay/requests')}>
            Acompanhar solicitação
          </Button>
          <Button onPress={() => router.replace('/(guest)/today')} variant="ghost">
            <Text colorToken="textSecondary" variant="bodyMedium">
              Voltar para Hoje
            </Text>
          </Button>
        </YStack>
      </YStack>
    </Screen>
  );
}
