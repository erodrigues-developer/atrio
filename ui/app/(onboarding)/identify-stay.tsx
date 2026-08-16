import { useRef, useState, type RefObject } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, Keyboard, TextInput } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { goBackOrReplace } from '@/src/navigation/go-back';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { DEFAULT_HOTEL_ID } from '@/src/services/api-config';
import { identifyStayAccess } from '@/src/services/atrio-api';
import { getPendingStayAccess, savePendingStayAccess } from '@/src/stores/session.store';

const INPUT_HEIGHT = 56;

type FieldErrors = {
  roomNumber?: string;
  lastName?: string;
};

type StayFieldProps = {
  autoCapitalize?: 'none' | 'words';
  autoCorrect?: boolean;
  editable: boolean;
  error?: string;
  inputRef?: RefObject<TextInput | null>;
  keyboardType?: 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  returnKeyType?: 'done' | 'next';
  value: string;
};

function StayField({
  autoCapitalize = 'none',
  autoCorrect = false,
  editable,
  error,
  inputRef,
  keyboardType = 'default',
  label,
  onChangeText,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  value,
}: StayFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <YStack gap={spacing.sm}>
      <Text colorToken="textSecondary" variant="bodySmall">
        {label}
      </Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={editable}
        ref={inputRef}
        keyboardType={keyboardType}
        onBlur={() => setIsFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType={returnKeyType}
        selectionColor={colors.accent}
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? colors.danger : isFocused ? colors.accent : colors.border,
          borderRadius: radius.md,
          borderWidth: 1,
          color: colors.textPrimary,
          fontSize: 16,
          height: INPUT_HEIGHT,
          paddingHorizontal: spacing.lg,
        }}
        value={value}
      />
      {error ? (
        <Text colorToken="danger" variant="caption">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}

export default function IdentifyStayScreen() {
  const pendingStayAccess = getPendingStayAccess();
  const [roomNumber, setRoomNumber] = useState(pendingStayAccess?.roomNumber ?? '');
  const [lastName, setLastName] = useState(pendingStayAccess?.lastName ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const lastNameInputRef = useRef<TextInput | null>(null);

  const validateFields = () => {
    const trimmedRoomNumber = roomNumber.trim();
    const trimmedLastName = lastName.trim();
    const nextErrors: FieldErrors = {};

    if (!trimmedRoomNumber) {
      nextErrors.roomNumber = 'Informe o número do quarto.';
    }

    if (!trimmedLastName) {
      nextErrors.lastName = 'Informe o sobrenome usado na reserva.';
    }

    setErrors(nextErrors);

    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedLastName,
      trimmedRoomNumber,
    };
  };

  const handleContinue = async () => {
    Keyboard.dismiss();

    const { isValid, trimmedLastName, trimmedRoomNumber } = validateFields();

    if (!isValid) {
      return;
    }

    setRoomNumber(trimmedRoomNumber);
    setLastName(trimmedLastName);
    savePendingStayAccess({
      lastName: trimmedLastName,
      roomNumber: trimmedRoomNumber,
    });
    setIsLoading(true);

    try {
      const challenge = await identifyStayAccess({
        hotelId: DEFAULT_HOTEL_ID,
        roomNumber: trimmedRoomNumber,
        lastName: trimmedLastName,
      });

      savePendingStayAccess({
        hotelId: DEFAULT_HOTEL_ID,
        lastName: trimmedLastName,
        roomNumber: trimmedRoomNumber,
        challengeId: challenge.challengeId,
        maskedPhone: challenge.maskedPhone,
        resendAvailableAt: challenge.resendAvailableAt,
        expiresAt: challenge.expiresAt,
      });

      router.push('/(onboarding)/verify-sms');
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Nao foi possivel localizar a estadia',
        error instanceof Error
          ? error.message
          : 'Confira os dados informados e tente novamente.',
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
            onPress={() => goBackOrReplace('/(onboarding)/welcome')}
          />

          <YStack gap={spacing.xxxl}>
            <YStack gap={spacing.md}>
              <Text maxWidth="88%" variant="title1">
                Identifique sua estadia
              </Text>
              <Text colorToken="textSecondary" maxWidth="94%" variant="body">
                Informe o número do quarto e o sobrenome usado na reserva.
              </Text>
            </YStack>

            <YStack gap={spacing.xl}>
              <StayField
                editable={!isLoading}
                error={errors.roomNumber}
                keyboardType="number-pad"
                label="Número do quarto"
                onChangeText={(value) => {
                  setRoomNumber(value);
                  if (errors.roomNumber) {
                    setErrors((current) => ({ ...current, roomNumber: undefined }));
                  }
                }}
                onSubmitEditing={() => lastNameInputRef.current?.focus()}
                placeholder="Ex: 304"
                returnKeyType="next"
                value={roomNumber}
              />

              <StayField
                autoCapitalize="words"
                editable={!isLoading}
                error={errors.lastName}
                inputRef={lastNameInputRef}
                label="Sobrenome"
                onChangeText={(value) => {
                  setLastName(value);
                  if (errors.lastName) {
                    setErrors((current) => ({ ...current, lastName: undefined }));
                  }
                }}
                onSubmitEditing={() => Keyboard.dismiss()}
                placeholder="Ex: Silva"
                returnKeyType="done"
                value={lastName}
              />

              <XStack
                alignItems="flex-start"
                backgroundColor={colors.accentSoft}
                borderColor={colors.borderSoft}
                borderRadius={18}
                borderWidth={1}
                gap={spacing.sm}
                paddingHorizontal={spacing.md}
                paddingVertical={14}>
                <MaterialIcons color={colors.accent} name="verified-user" size={15} />
                <Text colorToken="textSecondary" flex={1} variant="bodySmall">
                  Enviaremos um código de confirmação para o telefone vinculado à reserva.
                </Text>
              </XStack>
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

          <Button disabled={isLoading} onPress={handleContinue}>
            <Text colorToken="textInverse" variant="bodyMedium">
              {isLoading ? 'Localizando estadia...' : 'Continuar'}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </Screen>
  );
}
