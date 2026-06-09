import { YStack } from 'tamagui';

import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';

export default function DiscoverScreen() {
  return (
    <Screen>
      <YStack flex={1} gap={spacing.md} justifyContent="center">
        <Text variant="title1">Descobrir</Text>
        <Text colorToken="textSecondary" variant="body">
          Experiências selecionadas pelo hotel.
        </Text>
      </YStack>
    </Screen>
  );
}
