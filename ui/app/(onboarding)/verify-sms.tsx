import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { OtpInput } from '@/src/design-system/components/OtpInput';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';
import { saveSession } from '@/src/stores/session.store';

const VALID_CODE = '123456';
const LOADING_DELAY_MS = 650;

export default function VerifySmsScreen() {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(60);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (resendCooldownSeconds > 0) {
      intervalId = setInterval(() => {
        setResendCooldownSeconds((current) => {
          if (current <= 1) {
            if (intervalId) {
              clearInterval(intervalId);
            }

            return 0;
          }

          return current - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [resendCooldownSeconds]);

  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
    };
  }, []);

  const handleChangeCode = (nextCode: string) => {
    setCode(nextCode);

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleConfirm = () => {
    Keyboard.dismiss();

    const normalizedCode = code.replace(/\D/g, '').slice(0, 6);

    if (normalizedCode.length < 6) {
      setErrorMessage('Informe o código de 6 dígitos.');
      return;
    }

    setIsLoading(true);

    confirmTimeoutRef.current = setTimeout(() => {
      if (normalizedCode !== VALID_CODE) {
        setIsLoading(false);
        setErrorMessage('Código incorreto. Verifique o SMS recebido e tente novamente.');
        return;
      }

      saveSession({
        isAuthenticated: true,
        guestId: 'guest-001',
        stayId: 'stay-001',
        hotelId: 'copacabana-palace',
        roomNumber: '304',
        guestName: 'Everton Rodrigues',
      });

      try {
        router.replace('/(guest)/today');
      } catch {
        setIsLoading(false);
        setErrorMessage('Nao foi possivel abrir sua area da estadia agora. Tente novamente.');
      }
    }, LOADING_DELAY_MS);
  };

  const handleResendCode = () => {
    if (resendCooldownSeconds > 0) {
      return;
    }

    Keyboard.dismiss();
    setCode('');
    setErrorMessage('');
    setResendCooldownSeconds(60);
    Alert.alert(
      'Código reenviado',
      'Enviamos um novo código para o telefone vinculado à reserva.',
    );
  };

  return (
    <Screen dismissKeyboardOnPressOutside>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap={spacing.huge}>
          <BackButton
            accessibilityLabel="Voltar para identificação da estadia"
            disabled={isLoading}
            onPress={() => router.replace('/(onboarding)/identify-stay')}
          />

          <YStack gap={spacing.xxxl}>
            <YStack gap={spacing.md}>
              <Text maxWidth="88%" variant="title1">
                Confirme seu acesso
              </Text>
              <Text colorToken="textSecondary" maxWidth="94%" variant="body">
                Enviamos um código de 6 dígitos para o telefone vinculado à sua reserva.
              </Text>
              <Text colorToken="accent" variant="bodyMedium">
                (31) •••••-1234
              </Text>
            </YStack>

            <YStack gap={spacing.lg}>
              <OtpInput
                autoFocus
                editable={!isLoading}
                error={Boolean(errorMessage)}
                onChange={handleChangeCode}
                value={code}
              />

              {errorMessage ? (
                <Text colorToken="danger" variant="caption">
                  {errorMessage}
                </Text>
              ) : null}

              <YStack paddingTop={2}>
                <Button
                  alignSelf="flex-start"
                  disabled={isLoading || resendCooldownSeconds > 0}
                  minHeight={44}
                  onPress={handleResendCode}
                  paddingHorizontal={0}
                  variant="ghost">
                  <Text
                    colorToken={resendCooldownSeconds > 0 ? 'textMuted' : 'accent'}
                    variant="bodySmall">
                    {resendCooldownSeconds > 0
                      ? `Reenviar código em ${resendCooldownSeconds}s`
                      : 'Reenviar código'}
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </YStack>
        </YStack>

        <YStack gap={spacing.lg} paddingBottom={spacing.sm}>
          <Button
            alignSelf="center"
            disabled={isLoading}
            minHeight={44}
            onPress={() => {
              Keyboard.dismiss();
              Alert.alert('Preciso de ajuda', 'Nossa equipe poderá ajudar você a acessar sua estadia.');
            }}
            variant="ghost">
            <Text colorToken="textSecondary" variant="bodySmall">
              Preciso de ajuda
            </Text>
          </Button>

          <Button disabled={isLoading} onPress={handleConfirm}>
            <Text colorToken="textInverse" variant="bodyMedium">
              {isLoading ? 'Confirmando...' : 'Confirmar'}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </Screen>
  );
}
