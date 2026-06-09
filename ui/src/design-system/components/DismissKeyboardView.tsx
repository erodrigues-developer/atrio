import type { ReactNode } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

type Props = {
  children: ReactNode;
};

export function DismissKeyboardView({ children }: Props) {
  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
