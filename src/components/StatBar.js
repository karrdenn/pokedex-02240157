import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { C, F, STAT_LABELS } from '../theme';

// One animated stat bar. `max` lets the team screen scale the bar for combined stats.
export default function StatBar({ name, value, max = 255, delay = 0 }) {
  const w = useRef(new Animated.Value(0)).current;
  const ratio = Math.min(value / max, 1);

  useEffect(() => {
    Animated.timing(w, { toValue: ratio, duration: 650, delay, useNativeDriver: false }).start();
  }, [ratio]);

  const fill = ratio < 0.3 ? C.accent : ratio < 0.55 ? C.butter : C.mint;

  return (
    <View style={s.row}>
      <Text style={s.label}>{STAT_LABELS[name] || name}</Text>
      <Text style={s.value}>{value}</Text>
      <View style={s.track}>
        <Animated.View
          style={[s.fill, { backgroundColor: fill, width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  label: { width: 62, fontFamily: F.mono, fontWeight: '800', fontSize: 11, color: C.ink },
  value: { width: 44, fontFamily: F.mono, fontWeight: '800', fontSize: 14, color: C.ink, textAlign: 'right', marginRight: 10 },
  track: { flex: 1, height: 16, borderWidth: 2.5, borderColor: C.ink, borderRadius: 8, backgroundColor: C.paperDark, overflow: 'hidden' },
  fill: { height: '100%', borderRightWidth: 2.5, borderRightColor: C.ink },
});
