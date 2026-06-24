import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { BackButton } from '@/src/design-system/components/BackButton';
import { Button } from '@/src/design-system/components/Button';
import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { RequestStatusCard } from '@/src/design-system/product/RequestStatusCard';
import { resolveReturnTo } from '@/src/navigation/return-to';
import { spacing } from '@/src/design-system/tokens/spacing';
import { buildRequestDetails, loadRequests, useRequests } from '@/src/stores/requests.store';
import { useSession } from '@/src/stores/session.store';

export default function StayRequestsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const session = useSession();
  const requestsState = useRequests();

  useEffect(() => {
    if (!session?.stayId) {
      return;
    }

    loadRequests(session.stayId).catch(() => undefined);
  }, [session?.stayId]);

  function handleGoBack() {
    router.replace(resolveReturnTo(returnTo, '/(guest)/stay'));
  }

  return (
    <Screen paddingBottom={0} paddingHorizontal={0} paddingTop={0} safeAreaEdges={['bottom']}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.xxl,
          paddingBottom: tabBarHeight + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}>
        <YStack gap={spacing.xxl}>
          <BackButton accessibilityLabel="Voltar" onPress={handleGoBack} />

          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.5} variant="title1">
              Minhas solicitações
            </Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              Acompanhe os pedidos feitos ao hotel durante a sua estadia.
            </Text>
          </YStack>

          {requestsState.errorMessage ? (
            <Card gap={spacing.lg} padding={spacing.xl}>
              <Text colorToken="textSecondary" variant="bodySmall">
                {requestsState.errorMessage}
              </Text>
            </Card>
          ) : null}

          {requestsState.items.length > 0 ? (
            <YStack gap={spacing.md}>
              {requestsState.items.map((request) => (
                <RequestStatusCard
                  details={buildRequestDetails(request)}
                  key={request.id}
                  status={request.status}
                  statusType={request.statusType}
                  timeLabel={request.timeLabel}
                  title={request.title}
                />
              ))}
            </YStack>
          ) : (
            <Card gap={spacing.lg} padding={spacing.xl}>
              <YStack gap={spacing.xs}>
                <Text variant="bodyMedium">Você ainda não tem solicitações em andamento.</Text>
                <Text colorToken="textSecondary" variant="bodySmall">
                  Quando precisar de algo, faça uma solicitação em Serviços.
                </Text>
              </YStack>

              <Button alignSelf="flex-start" onPress={() => router.push('/(guest)/services')}>
                Ir para Serviços
              </Button>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
