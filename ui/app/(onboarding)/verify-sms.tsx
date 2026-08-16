import { useEffect, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { OtpInput } from '@/src/design-system/components/OtpInput';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { goBackOrReplace } from '@/src/navigation/go-back';
import { spacing } from '@/src/design-system/tokens/spacing';
import { resendStayAccessCode, verifyStayAccess } from '@/src/services/atrio-api';
import {
  clearPendingStayAccess,
  getPendingStayAccess,
  saveAuthTokens,
  savePendingStayAccess,
  saveSession,
} from '@/src/stores/session.store';

function getCooldownSeconds(resendAvailableAt?: string) {
  if (!resendAvailableAt) {
    return 0;
  }

  const remainingMs = new Date(resendAvailableAt).getTime() - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

export default function VerifySmsScreen() {
  const pendingStayAccess = getPendingStayAccess();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(
    getCooldownSeconds(pendingStayAccess?.resendAvailableAt),
  );

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

    if (!pendingStayAccess?.challengeId) {
      setErrorMessage('Sua validacao expirou. Recomece a identificacao da estadia.');
      return;
    }

    setIsLoading(true);

    verifyStayAccess({
      challengeId: pendingStayAccess.challengeId,
      code: normalizedCode,
    })
      .then((response) => {
        saveAuthTokens(response.accessToken, response.refreshToken);

        const roomNumber = pendingStayAccess.roomNumber || response.session.roomNumber;
        saveSession({
          ...response.session,
          hotelName: response.stay.hotelName,
          checkOutTime: response.stay.checkOutTime,
          roomNumber,
        });
        clearPendingStayAccess();
        router.replace('/(guest)/today');
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel confirmar seu acesso agora. Tente novamente.',
        );
      });
  };

  const handleResendCode = async () => {
    if (resendCooldownSeconds > 0 || !pendingStayAccess?.challengeId) {
      return;
    }

    Keyboard.dismiss();

    try {
      const response = await resendStayAccessCode({
        challengeId: pendingStayAccess.challengeId,
      });

      savePendingStayAccess({
        ...pendingStayAccess,
        challengeId: response.challengeId,
        maskedPhone: response.maskedPhone,
        resendAvailableAt: response.resendAvailableAt,
        expiresAt: response.expiresAt,
      });
      setCode('');
      setErrorMessage('');
      setResendCooldownSeconds(getCooldownSeconds(response.resendAvailableAt));
      Alert.alert(
        'Codigo reenviado',
        'Enviamos um novo codigo para o telefone vinculado a reserva.',
      );
    } catch (error) {
      Alert.alert(
        'Nao foi possivel reenviar o codigo',
        error instanceof Error
          ? error.message
          : 'Tente novamente em alguns instantes.',
      );
    }
  };

  return (
    <Screen dismissKeyboardOnPressOutside>
      <YStack flex={1} justifyContent="space-between">
        <YStack gap={spacing.huge}>
          <BackButton
            accessibilityLabel="Voltar"
            disabled={isLoading}
            onPress={() => goBackOrReplace('/(onboarding)/identify-stay')}
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
                {pendingStayAccess?.maskedPhone ?? 'Telefone nao identificado'}
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
