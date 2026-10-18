import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, F, TYPE_COLORS } from '../theme';

export default function TypeChip({ type }) {
  return (
    <View style={[s.chip, { backgroundColor: TYPE_COLORS[type] || C.paperDark }]}>
      <Text style={s.text}>{type.toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { borderWidth: 2.5, borderColor: C.ink, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 },
  text: { fontFamily: F.mono, fontWeight: '800', fontSize: 12, letterSpacing: 1, color: C.ink },
});
