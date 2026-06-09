import type { ReactNode } from 'react';
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native';

type Props = {
  children: ReactNode;
};

export function DismissKeyboardView({ children }: Props) {
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
