import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

export default function Screen({ children, style }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ flex: 1, backgroundColor: C.paper, paddingTop: insets.top }, style]}>{children}</View>;
}
