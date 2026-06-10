import { ScrollView } from 'react-native';
import { XStack } from 'tamagui';

import { Text } from '@/src/design-system/components/Text';
import { ExperienceCard } from '@/src/design-system/product/ExperienceCard';
import { spacing } from '@/src/design-system/tokens/spacing';
import type { ExperienceItem } from '@/src/mocks/experiences.mock';

type HorizontalExperienceListProps = {
  items: ExperienceItem[];
  onPressItem?: (item: ExperienceItem) => void;
};

export function HorizontalExperienceList({ items, onPressItem }: HorizontalExperienceListProps) {
  if (items.length === 0) {
    return (
      <Text colorToken="textSecondary" variant="bodySmall">
        Nenhuma experiência disponível nesta coleção no momento.
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        paddingRight: spacing.xxl,
      }}
      showsHorizontalScrollIndicator={false}>
      <XStack gap={spacing.md}>
        {items.map((item) => (
          <ExperienceCard
            badge={item.badge}
            category={item.category}
            description={item.description}
            imageSource={item.imageSource}
            key={item.id}
            onPress={onPressItem ? () => onPressItem(item) : undefined}
            priceLabel={item.priceLabel}
            timeLabel={item.timeLabel}
            title={item.title}
          />
        ))}
      </XStack>
    </ScrollView>
  );
}
