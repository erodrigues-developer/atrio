import { XStack, YStack } from 'tamagui';

import { Card } from '@/src/design-system/components/Card';
import { Text } from '@/src/design-system/components/Text';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';

type ExperienceInfoItem = {
  label: string;
  value: string;
};

type ExperienceInfoGridProps = {
  items: ExperienceInfoItem[];
};

export function ExperienceInfoGrid({ items }: ExperienceInfoGridProps) {
  const rows = [items.slice(0, 2), items.slice(2, 4)];

  return (
    <Card borderRadius={radius.xl} overflow="hidden" padding={0}>
      {rows.map((row, rowIndex) => (
        <XStack key={`row-${rowIndex}`}>
          {row.map((item, columnIndex) => (
            <YStack
              borderRightColor={columnIndex === 0 ? colors.borderSoft : 'transparent'}
              borderRightWidth={columnIndex === 0 ? 1 : 0}
              borderTopColor={rowIndex === 1 ? colors.borderSoft : 'transparent'}
              borderTopWidth={rowIndex === 1 ? 1 : 0}
              flex={1}
              gap={spacing.xs}
              key={item.label}
              minHeight={96}
              paddingHorizontal={spacing.lg}
              paddingVertical={spacing.lg}>
              <Text colorToken="textSecondary" variant="caption">
                {item.label}
              </Text>
              <Text variant="bodyMedium">{item.value}</Text>
            </YStack>
          ))}
        </XStack>
      ))}
    </Card>
  );
}
