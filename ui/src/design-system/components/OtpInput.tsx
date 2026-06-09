import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput, type NativeSyntheticEvent, type TextInputKeyPressEventData } from 'react-native';
import { XStack } from 'tamagui';

import { colors } from '@/src/design-system/tokens/colors';
import { radius } from '@/src/design-system/tokens/radius';

const CELL_HEIGHT = 53;
const CELL_WIDTH = 45;

type Props = {
  autoFocus?: boolean;
  cellCount?: number;
  editable?: boolean;
  error?: boolean;
  onChange: (value: string) => void;
  value: string;
};

export function OtpInput({
  autoFocus = false,
  cellCount = 6,
  editable = true,
  error = false,
  onChange,
  value,
}: Props) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);

  const digits = useMemo(() => {
    const normalizedValue = value.slice(0, cellCount);
    return Array.from({ length: cellCount }, (_, index) => normalizedValue[index] ?? '');
  }, [cellCount, value]);

  useEffect(() => {
    if (!autoFocus || !editable) {
      return;
    }

    const timeoutId = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [autoFocus, editable]);

  const focusInput = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, cellCount - 1));
    inputRefs.current[boundedIndex]?.focus();
    setFocusedIndex(boundedIndex);
  };

  const applyValueFromIndex = (index: number, nextText: string) => {
    const sanitizedText = nextText.replace(/\D/g, '');

    if (!sanitizedText) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    const nextDigits = [...digits];
    let targetIndex = index;

    for (const digit of sanitizedText) {
      if (targetIndex >= cellCount) {
        break;
      }

      nextDigits[targetIndex] = digit;
      targetIndex += 1;
    }

    onChange(nextDigits.join(''));

    if (targetIndex < cellCount) {
      focusInput(targetIndex);
      return;
    }

    inputRefs.current[cellCount - 1]?.blur();
    setFocusedIndex(null);
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (event.nativeEvent.key !== 'Backspace') {
      return;
    }

    if (digits[index]) {
      return;
    }

    if (index > 0) {
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      onChange(nextDigits.join(''));
      focusInput(index - 1);
    }
  };

  return (
    <XStack
      alignItems="center"
      flexWrap="nowrap"
      gap={3}
      justifyContent="center"
      width="100%">
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;

        return (
          <TextInput
            key={index}
            autoComplete={index === 0 ? 'sms-otp' : undefined}
            autoCorrect={false}
            blurOnSubmit={false}
            editable={editable}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={cellCount}
            onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
            onChangeText={(text) => applyValueFromIndex(index, text)}
            onFocus={() => setFocusedIndex(index)}
            onKeyPress={(event) => handleKeyPress(index, event)}
            onSubmitEditing={() => Keyboard.dismiss()}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            returnKeyType="done"
            selectTextOnFocus
            selectionColor={colors.accent}
            style={{
              backgroundColor: colors.surface,
              borderColor: error ? colors.danger : isFocused ? colors.accent : colors.border,
              borderRadius: radius.md,
              borderWidth: 1,
              color: colors.textPrimary,
              flex: 1,
              fontSize: 20,
              fontWeight: '600',
              height: CELL_HEIGHT,
              maxWidth: CELL_WIDTH,
              minWidth: 44,
              textAlign: 'center',
            }}
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            value={digit}
          />
        );
      })}
    </XStack>
  );
}
