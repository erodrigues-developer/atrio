import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import {
  Bath,
  Luggage,
  MessageSquareText,
  Package,
  Shirt,
  Sparkles,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Screen } from '@/src/design-system/components/Screen';
import { Text } from '@/src/design-system/components/Text';
import { ServiceListItem } from '@/src/design-system/product/ServiceListItem';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { servicesMock, type ServiceIconId } from '../../../src/mocks/services.mock';

const serviceIcons: Record<ServiceIconId, LucideIcon> = {
  Bath,
  Sparkles,
  Package,
  Wrench,
  Shirt,
  Luggage,
  Utensils,
  MessageSquareText,
};

export default function ServicesScreen() {
  const tabBarHeight = useBottomTabBarHeight();

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
          <YStack gap={spacing.sm}>
            <Text letterSpacing={-0.5} variant="title1">
              Serviços
            </Text>
            <Text colorToken="textSecondary" maxWidth="92%" variant="body">
              Solicite itens, apoio ou cuidados para sua estadia.
            </Text>
          </YStack>

          <Card borderRadius={radius.xl} paddingHorizontal={spacing.xl} paddingVertical={spacing.sm}>
            {servicesMock.map((service, index) => {
              const Icon = serviceIcons[service.icon];

              return (
                <ServiceListItem
                  key={service.id}
                  description={service.description}
                  icon={<Icon color={colors.textSecondary} size={18} strokeWidth={1.9} />}
                  isLast={index === servicesMock.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: '/(guest)/services/request/[type]',
                      params: {
                        type: service.id,
                        returnTo: '/(guest)/services',
                      },
                    } as Href)
                  }
                  title={service.title}
                />
              );
            })}
          </Card>

          <Card backgroundToken="accentSoft" borderRadius={radius.xl} gap={spacing.md} padding={spacing.xl}>
            <YStack gap={spacing.xs}>
              <Text variant="title3">Precisa de algo diferente?</Text>
              <Text colorToken="textSecondary" variant="bodySmall">
                Fale com o concierge e conte o que você precisa.
              </Text>
            </YStack>

            <Text colorToken="accent" onPress={() => router.push('/(guest)/concierge')} variant="bodyMedium">
              Falar com o concierge
            </Text>
          </Card>
        </YStack>
      </ScrollView>
    </Screen>
  );
}
