import React from 'react';
import { Pressable, View } from 'react-native';
import { BORDER, C, SHADOW } from '../theme';

// Signature element of the app: an outlined box with a hard offset shadow.
// When it has an onPress it "sinks" into its shadow when pressed.
export default function HardBox({
  children, style, contentStyle, color = C.card, radius = 14, shadow = SHADOW, onPress, disabled,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[{ paddingRight: shadow, paddingBottom: shadow }, style]}
    >
      {({ pressed }) => (
        <>
          <View
            style={{
              position: 'absolute', top: shadow, left: shadow, right: 0, bottom: 0,
              backgroundColor: C.ink, borderRadius: radius,
            }}
          />
          <View
            style={[
              {
                backgroundColor: color, borderWidth: BORDER, borderColor: C.ink,
                borderRadius: radius, flexGrow: 1, overflow: 'hidden',
                transform: [{ translateX: pressed ? shadow : 0 }, { translateY: pressed ? shadow : 0 }],
              },
              contentStyle,
            ]}
          >
            {children}
          </View>
        </>
      )}
    </Pressable>
  );
}
