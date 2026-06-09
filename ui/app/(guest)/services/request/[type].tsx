import { useLocalSearchParams } from 'expo-router';
import { YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';
import { servicesMock, type ServiceType } from '@/src/mocks/services.mock';

export default function ServiceRequestPlaceholderScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const service = servicesMock.find((item) => item.id === (type as ServiceType | undefined));

  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} justifyContent="center">
        <Card gap={spacing.md}>
          {service ? (
            <Text colorToken="textSecondary" variant="caption">
              {service.title}
            </Text>
          ) : null}
          <Text variant="title1">Solicitação</Text>
          <Text colorToken="textSecondary" variant="body">
            Em breve você poderá concluir esta solicitação.
          </Text>
        </Card>
      </YStack>
    </Screen>
  );
}
