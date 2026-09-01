import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Copy, Info, Wifi } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { resolveReturnTo } from '@/src/navigation/return-to';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getStayWifi, type WifiResponse } from '@/src/services/atrio-api';
import { useSession } from '@/src/stores/session.store';

const COPY_FEEDBACK_DURATION_MS = 2400;

export default function WifiScreen() {
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const session = useSession();
  const [wifi, setWifi] = useState<WifiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();

  useEffect(() => {
    if (!isFocused || !session?.stayId) {
      return;
    }

    let isMounted = true;

    getStayWifi(session.stayId)
      .then((response) => {
        if (isMounted) {
          setWifi(response);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Nao foi possivel carregar os dados de Wi-Fi.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isFocused, session?.stayId]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  function handleGoBack() {
    router.replace(resolveReturnTo(params.returnTo, '/(guest)/stay'));
  }

  async function handleCopyPassword() {
    if (!wifi?.password) {
      return;
    }

    await Clipboard.setStringAsync(wifi.password);
    setHasCopiedPassword(true);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setHasCopiedPassword(false);
    }, COPY_FEEDBACK_DURATION_MS);
  }

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxl}>
          <Button
            accessibilityLabel="Voltar"
            alignSelf="flex-start"
            backgroundColor="transparent"
            height={44}
            onPress={handleGoBack}
            paddingHorizontal={0}
            pressStyle={{
              opacity: 0.7,
            }}
            variant="ghost">
            <XStack alignItems="center" gap={spacing.xs}>
              <ChevronLeft color={colors.textSecondary} size={20} strokeWidth={1.9} />
              <Text colorToken="textSecondary" variant="bodySmall">
                Voltar
              </Text>
            </XStack>
          </Button>

          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.5} variant="title1">
              Wi-Fi
            </Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              Acesse a rede de internet disponível no hotel.
            </Text>
          </YStack>

          {wifi?.network && wifi.password ? (
            <>
              <Card borderRadius={radius.xl} gap={spacing.xl} padding={spacing.xl}>
                <YStack gap={spacing.xs}>
                  <Text colorToken="textSecondary" variant="caption">
                    Rede
                  </Text>
                  <Text variant="title3">{wifi.network}</Text>
                </YStack>

                <YStack gap={spacing.xs}>
                  <Text colorToken="textSecondary" variant="caption">
                    Senha
                  </Text>
                  <Text variant="title3">{wifi.password}</Text>
                </YStack>

                <Button onPress={handleCopyPassword}>
                  <XStack alignItems="center" gap={spacing.sm}>
                    <Copy color={colors.textInverse} size={18} strokeWidth={1.9} />
                    <Text colorToken="textInverse" variant="bodyMedium">
                      {hasCopiedPassword ? 'Senha copiada' : 'Copiar senha'}
                    </Text>
                  </XStack>
                </Button>
              </Card>

              <Card backgroundToken="surfaceSoft" borderRadius={radius.xl} gap={spacing.md} padding={spacing.xl}>
                <XStack alignItems="center" gap={spacing.sm}>
                  <Info color={colors.accent} size={18} strokeWidth={1.9} />
                  <Text variant="bodyMedium">Como conectar</Text>
                </XStack>

                <Text colorToken="textSecondary" variant="body">
                  Abra as configurações de Wi-Fi do seu dispositivo, selecione a rede do hotel e
                  informe a senha acima.
                </Text>
              </Card>
            </>
          ) : (
            <Card borderRadius={radius.xl} gap={spacing.xl} padding={spacing.xl}>
              <XStack alignItems="center" gap={spacing.sm}>
                <Wifi color={colors.accent} size={20} strokeWidth={1.9} />
                <Text variant="title3">Informações de Wi-Fi indisponíveis</Text>
              </XStack>

              <Text colorToken="textSecondary" variant="body">
                {errorMessage ?? 'Fale com o concierge ou com a recepção para receber ajuda com a conexão.'}
              </Text>

              <Button onPress={() => router.push('/(guest)/concierge')}>
                Falar com o concierge
              </Button>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
