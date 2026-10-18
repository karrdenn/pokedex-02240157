import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '../theme';

// Icons are drawn with plain Views (no icon library needed)
function Glyph({ name, color }) {
  if (name === 'Pokedex') {
    return (
      <View style={{ width: 22, height: 22, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between' }}>
        {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />)}
      </View>
    );
  }
  if (name === 'MyTeam') {
    return (
      <View style={{ width: 26, height: 22, flexDirection: 'row', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, borderWidth: 2, borderColor: C.card, marginLeft: i ? -5 : 0 }} />
        ))}
      </View>
    );
  }
  return <Text style={{ fontFamily: F.serif, fontWeight: '900', fontSize: 24, color, lineHeight: 26 }}>?</Text>;
}

export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = descriptors[route.key].options.title || route.name;
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={s.slot}>
            <View style={[s.pill, focused && s.pillOn]}>
              <Glyph name={route.name} color={C.ink} />
              <Text style={s.label}>{label.toUpperCase()}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: C.paperDark, borderTopWidth: 3, borderTopColor: C.ink, paddingTop: 12, paddingHorizontal: 10 },
  slot: { flex: 1, alignItems: 'center' },
  pill: { alignItems: 'center', justifyContent: 'center', width: '90%', paddingVertical: 8, borderRadius: 14, borderWidth: 3, borderColor: 'transparent' },
  pillOn: { backgroundColor: C.butter, borderColor: C.ink, transform: [{ translateY: -4 }], borderBottomWidth: 6 },
  label: { fontFamily: F.mono, fontWeight: '800', fontSize: 10, letterSpacing: 1, color: C.ink, marginTop: 3 },
});
