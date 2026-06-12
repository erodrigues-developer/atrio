import { router } from 'expo-router';
import { BedDouble } from 'lucide-react-native';
import { YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { InfoListItem } from '@/src/design-system/product/InfoListItem';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

export default function StayScreen() {
  return (
    <Screen safeAreaEdges={['bottom']}>
      <YStack flex={1} gap={spacing.xxxl}>
        <YStack gap={spacing.sm}>
          <Text variant="title1">Estadia</Text>
          <Text colorToken="textSecondary" variant="body">
            Informações e acompanhamentos da sua hospedagem.
          </Text>
        </YStack>

        <Card borderRadius={radius.xl} paddingHorizontal={spacing.lg} paddingVertical={spacing.sm}>
          <InfoListItem
            description="Veja o que foi reservado, quando acontece e como está cada confirmação."
            icon={BedDouble}
            isLast
            onPress={() => router.push('/(guest)/stay/reservations')}
            title="Minhas reservas"
          />
        </Card>

        <Text colorToken="textSecondary" variant="body">
          Informações úteis da estadia serão adicionadas aqui nas próximas etapas.
        </Text>
      </YStack>
    </Screen>
  );
}
