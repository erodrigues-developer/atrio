import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Button } from '@/src/design-system/components/Button';
import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';
import { spacing } from '@/src/design-system/tokens/spacing';
import { typography } from '@/src/design-system/tokens/typography';

type ConciergeInputBarProps = {
  onChangeText: (text: string) => void;
  onSend: () => void;
  value: string;
};

export const conciergeInputBarHeight = 52;
const conciergeInputBarMaxHeight = 132;

export function ConciergeInputBar({ onChangeText, onSend, value }: ConciergeInputBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const canSend = value.trim().length > 0;

  return (
    <XStack alignItems="flex-end" gap={spacing.sm}>
      <YStack
        backgroundColor={colors.surface}
        borderColor={isFocused ? colors.accent : colors.borderSoft}
        borderRadius={radius.pill}
        borderWidth={1}
        flex={1}
        minHeight={conciergeInputBarHeight}
        maxHeight={conciergeInputBarMaxHeight}
        justifyContent="center"
        paddingHorizontal={spacing.lg}
        paddingVertical={spacing.md}>
        <TextInput
          blurOnSubmit={false}
          multiline
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={() => {
            if (canSend) {
              onSend();
            }
          }}
          placeholder="Escreva sua mensagem"
          placeholderTextColor={colors.textMuted}
          returnKeyType="default"
          scrollEnabled
          selectionColor={colors.accent}
          style={[
            typography.body,
            {
              color: colors.textPrimary,
              maxHeight: conciergeInputBarMaxHeight - spacing.xl,
              padding: 0,
              textAlignVertical: 'top',
            },
          ]}
          value={value}
        />
      </YStack>

      <Button
        accessibilityLabel="Enviar mensagem"
        backgroundColor={canSend ? colors.accent : colors.surfaceMuted}
        borderRadius={radius.pill}
        disabled={!canSend}
        height={44}
        justifyContent="center"
        onPress={onSend}
        opacity={canSend ? 1 : 0.7}
        paddingHorizontal={0}
        pressStyle={{
          backgroundColor: colors.accentHover,
        }}
        width={44}>
        <Send color={colors.textInverse} size={18} strokeWidth={2} />
      </Button>
    </XStack>
  );
}
