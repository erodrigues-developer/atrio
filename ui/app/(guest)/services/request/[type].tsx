import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
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
import { stayMock } from '@/src/mocks/stay.mock';
import { servicesMock, type ServiceType } from '@/src/mocks/services.mock';
import { createRequest } from '@/src/stores/requests.store';
import { useSession } from '@/src/stores/session.store';

type RequestContent = {
  conciergeMessage?: string;
  description: string;
  title: string;
};

const towelsRequestContent: RequestContent = {
  title: 'Toalhas extras',
  description: 'Quantas unidades deseja receber no quarto?',
};

const requestContentByType: Partial<Record<ServiceType, RequestContent>> = {
  towels: towelsRequestContent,
  cleaning: {
    title: 'Limpeza',
    description: 'Este serviço será concluído em uma próxima etapa do app.',
  },
};

function getFallbackContent(type?: ServiceType, serviceTitle?: string): RequestContent {
  if (type && requestContentByType[type]) {
    return requestContentByType[type] as RequestContent;
  }

  if (serviceTitle) {
    return {
      title: serviceTitle,
      description: 'Este serviço será concluído em uma próxima etapa do app.',
    };
  }

  return {
    title: 'Solicitação',
    description: 'Este serviço será concluído em uma próxima etapa do app.',
  };
}

function getPlaceholderContent(type?: ServiceType, serviceTitle?: string): RequestContent {
  const fallbackContent = getFallbackContent(type, serviceTitle);

  return {
    ...fallbackContent,
    conciergeMessage:
      'Enquanto isso, você pode falar com o concierge para solicitar apoio da equipe do hotel.',
  };
}

export default function ServiceRequestScreen() {
  const { returnTo, type } = useLocalSearchParams<{ returnTo?: string | string[]; type?: string }>();
  const session = useSession();
  const service = servicesMock.find((item) => item.id === (type as ServiceType | undefined));
  const tabBarHeight = useBottomTabBarHeight();
  const roomNumber = session?.roomNumber ?? stayMock.roomNumber;
  const [quantity, setQuantity] = useState(2);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typedService = type as ServiceType | undefined;
  const isTowels = typedService === 'towels';
  const content = isTowels ? towelsRequestContent : getFallbackContent(typedService, service?.title);
  const placeholderContent = getPlaceholderContent(typedService, service?.title);

  function handleGoBack() {
    router.replace(resolveReturnTo(returnTo, '/(guest)/services'));
  }

  async function handleSubmit() {
    if (!isTowels || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    const requestedAt = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    createRequest({
      createdAt: `Solicitado às ${requestedAt}`,
      note: note.trim(),
      quantity,
      roomNumber,
      status: 'Recebido',
      statusType: 'received',
      timeLabel: `Solicitado às ${requestedAt}`,
      title: towelsRequestContent.title,
      type: 'towels',
    });

    setIsSubmitting(false);
    router.push(`/(guest)/services/request/towels/confirmation` as Href);
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
                {isTowels ? content.title : placeholderContent.title}
              </Text>
              <Text colorToken="textSecondary" maxWidth="92%" variant="body">
                {isTowels ? content.description : placeholderContent.description}
              </Text>
            </YStack>

            {isTowels ? (
              <>
                <YStack gap={spacing.md}>
                  <Text variant="bodyMedium">Quantidade</Text>
                  <QuantitySelector
                    disabled={isSubmitting}
                    max={10}
                    min={1}
                    onChange={setQuantity}
                    value={quantity}
                  />
                </YStack>

                <YStack gap={spacing.md}>
                  <Text variant="bodyMedium">Observação opcional</Text>
                  <TextArea
                    disabled={isSubmitting}
                    onChangeText={setNote}
                    placeholder="Ex: deixar na porta, se possível"
                    returnKeyType="done"
                    value={note}
                  />
                </YStack>

                <Card backgroundToken="surfaceSoft" borderRadius={radius.md} gap={spacing.sm} padding={spacing.lg}>
                  <Text colorToken="textSecondary" variant="bodySmall">
                    A equipe do hotel receberá sua solicitação para o quarto {roomNumber}.
                  </Text>
                </Card>

                <Button disabled={isSubmitting} onPress={handleSubmit}>
                  <Text colorToken="textInverse" variant="bodyMedium">
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
                  </Text>
                </Button>
              </>
            ) : (
              <>
                <Card backgroundToken="surfaceSoft" borderRadius={radius.md} gap={spacing.md} padding={spacing.xl}>
                  <Text colorToken="textSecondary" variant="body">
                    {placeholderContent.conciergeMessage}
                  </Text>
                </Card>

                <YStack gap={spacing.sm}>
                  <Button onPress={() => router.push('/(guest)/concierge')}>Falar com o concierge</Button>
                  <Button onPress={() => router.push('/(guest)/services')} variant="ghost">
                    <Text colorToken="textSecondary" variant="bodyMedium">
                      Voltar para Serviços
                    </Text>
                  </Button>
                </YStack>
              </>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
