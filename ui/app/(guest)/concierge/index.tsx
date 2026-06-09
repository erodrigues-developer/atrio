import { YStack } from 'tamagui';

import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { spacing } from '@/src/design-system/tokens/spacing';

export default function ConciergeScreen() {
  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} gap={spacing.md} justifyContent="center">
        <Text variant="title1">Concierge</Text>
        <Text colorToken="textSecondary" variant="body">
          Fale com o hotel sempre que precisar.
        </Text>
      </YStack>
    </Screen>
  );
}
