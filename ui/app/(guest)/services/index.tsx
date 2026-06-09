import { YStack } from 'tamagui';

import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';

export default function ServicesScreen() {
  return (
    <Screen>
      <YStack flex={1} gap={spacing.md} justifyContent="center">
        <Text variant="title1">Serviços</Text>
        <Text colorToken="textSecondary" variant="body">
          Solicite o que precisar durante a estadia.
        </Text>
      </YStack>
    </Screen>
  );
}
