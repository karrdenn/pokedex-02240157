import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import HardBox from './HardBox';
import { C, F } from '../theme';

export function Loading({ label = 'Consulting the archive…' }) {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={C.accent} />
      <Text style={s.mono}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <View style={s.center}>
      <Text style={s.big}>Signal lost</Text>
      <Text style={s.mono}>{message || 'Could not reach PokéAPI. Check your internet.'}</Text>
      <HardBox color={C.accent} onPress={onRetry} style={{ marginTop: 18 }} contentStyle={s.btn}>
        <Text style={s.btnText}>RETRY ↻</Text>
      </HardBox>
    </View>
  );
}

export function Empty({ title, text }) {
  return (
    <View style={s.center}>
      <Text style={s.big}>{title}</Text>
      <Text style={s.mono}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 28 },
  big: { fontFamily: F.serif, fontSize: 26, fontWeight: '900', color: C.ink, marginBottom: 6, textAlign: 'center' },
  mono: { fontFamily: F.mono, fontSize: 12, color: C.ink, opacity: 0.75, textAlign: 'center', marginTop: 8 },
  btn: { paddingHorizontal: 26, paddingVertical: 12 },
  btnText: { fontFamily: F.mono, fontWeight: '800', fontSize: 14, color: C.ink },
});
