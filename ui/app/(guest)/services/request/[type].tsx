import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { TextArea } from '@/src/design-system/components/TextArea';
import { QuantitySelector } from '@/src/design-system/components/QuantitySelector';
import { Card } from '@/src/design-system/components/Card';
import { resolveReturnTo } from '@/src/navigation/return-to';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { getService, type ServiceResponse } from '@/src/services/atrio-api';
import { createRequest } from '@/src/stores/requests.store';
import { useSession } from '@/src/stores/session.store';

type RequestField = ServiceResponse['requestSchema']['fields'][number];

export default function ServiceRequestScreen() {
  const { returnTo, type } = useLocalSearchParams<{ returnTo?: string | string[]; type?: string }>();
  const session = useSession();
  const tabBarHeight = useBottomTabBarHeight();
  const [service, setService] = useState<ServiceResponse | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!type) {
      return;
    }

    let isMounted = true;

    getService(type)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setService(response);
        const quantityField = response.requestSchema.fields.find((field) => field.name === 'quantity');

        if (quantityField?.defaultValue) {
          setQuantity(quantityField.defaultValue);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Nao foi possivel carregar este servico.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [type]);

  const quantityField = service?.requestSchema.fields.find((field) => field.name === 'quantity');
  const noteField = service?.requestSchema.fields.find((field) => field.name === 'note');

  function handleGoBack() {
    router.replace(resolveReturnTo(returnTo, '/(guest)/services'));
  }

  async function handleSubmit() {
    if (!session?.stayId || !service || !type || isSubmitting) {
      return;
    }

    if (noteField?.required && !note.trim()) {
      setErrorMessage('Preencha os detalhes solicitados antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const createdRequest = await createRequest(session.stayId, {
        serviceId: type,
        quantity: quantityField ? quantity : undefined,
        note: note.trim() || undefined,
      });

      router.push({
        pathname: '/(guest)/services/request/[type]/confirmation',
        params: {
          type,
          requestId: createdRequest.id,
        },
      } as Href);
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel enviar a solicitacao.',
      );
    }
  }

  function getNotePlaceholder(field?: RequestField) {
    if (field?.label) {
      return `Ex: ${field.label}`;
    }

    return 'Descreva os detalhes, se necessário';
  }

  return (
    <Screen
      dismissKeyboardOnPressOutside
      paddingBottom={0}
      paddingHorizontal={0}
      paddingTop={0}
      safeAreaEdges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xxl,
            paddingTop: spacing.lg,
            paddingBottom: tabBarHeight + spacing.xl,
          }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <YStack gap={spacing.xxl}>
            <BackButton accessibilityLabel="Voltar" onPress={handleGoBack} />

            <YStack gap={spacing.sm}>
              <Text letterSpacing={-0.5} variant="title1">
                {service?.title ?? 'Solicitação'}
              </Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                {service?.description ?? errorMessage ?? 'Estamos carregando os detalhes do serviço.'}
              </Text>
            </YStack>

            {service ? (
              <>
                {quantityField ? (
                  <YStack gap={spacing.md}>
                    <Text variant="bodyMedium">{quantityField.label ?? 'Quantidade'}</Text>
                    <QuantitySelector
                      disabled={isSubmitting}
                      max={quantityField.max ?? 10}
                      min={quantityField.min ?? 1}
                      onChange={setQuantity}
                      value={quantity}
                    />
                  </YStack>
                ) : null}

                {noteField ? (
                  <YStack gap={spacing.md}>
                    <Text variant="bodyMedium">{noteField.label ?? 'Observação'}</Text>
                    <TextArea
                      disabled={isSubmitting}
                      onChangeText={setNote}
                      placeholder={getNotePlaceholder(noteField)}
                      returnKeyType="done"
                      value={note}
                    />
                  </YStack>
                ) : null}

                <Card backgroundToken="surfaceSoft" borderRadius={radius.md} gap={spacing.sm} padding={spacing.lg}>
                  <Text colorToken="textSecondary" variant="bodySmall">
                    A equipe do hotel receberá sua solicitação para o quarto {session?.roomNumber}.
                  </Text>
                </Card>

                {errorMessage ? (
                  <Text colorToken="danger" variant="bodySmall">
                    {errorMessage}
                  </Text>
                ) : null}

                <Button disabled={isSubmitting} onPress={handleSubmit}>
                  <Text colorToken="textInverse" variant="bodyMedium">
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
                  </Text>
                </Button>
              </>
            ) : (
              <Card backgroundToken="surfaceSoft" borderRadius={radius.md} gap={spacing.md} padding={spacing.xl}>
                <Text colorToken="textSecondary" variant="body">
                  {errorMessage ?? 'Carregando os detalhes do serviço...'}
                </Text>
              </Card>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
