import React, { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import HardBox from '../components/HardBox';
import StatBar from '../components/StatBar';
import TypeChip from '../components/TypeChip';
import { Empty } from '../components/StateViews';
import { sprite, prettyName } from '../api';
import { MAX_TEAM, useTeam } from '../TeamContext';
import { STUDENT_NAME } from '../config';
import { C, F, tintFor } from '../theme';

export default function TeamScreen({ navigation }) {
  const { team, remove } = useTeam();

  // combined base stats of all members
  const totals = useMemo(() => {
    const sums = {};
    team.forEach((p) => p.stats.forEach((st) => { sums[st.name] = (sums[st.name] || 0) + st.value; }));
    return Object.entries(sums).map(([name, value]) => ({ name, value }));
  }, [team]);
  const grand = totals.reduce((a, b) => a + b.value, 0);

  const header = (
    <View>
      {/* six slots */}
      <View style={s.slots}>
        {Array.from({ length: MAX_TEAM }).map((_, i) => {
          const p = team[i];
          return (
            <View key={i} style={s.slotWrap}>
              {p ? (
                <Pressable onPress={() => navigation.navigate('Detail', { id: p.id })} style={[s.slot, { backgroundColor: tintFor(p.id), borderStyle: 'solid' }]}>
                  <Image source={{ uri: sprite(p.id) }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </Pressable>
              ) : (
                <View style={s.slot}><Text style={s.plus}>+</Text></View>
              )}
            </View>
          );
        })}
      </View>

      {team.length > 0 && (
        <HardBox style={{ marginTop: 14 }} contentStyle={{ padding: 14 }}>
          <View style={s.statHead}>
            <Text style={s.mLabel}>COMBINED BASE STATS</Text>
            <Text style={s.grand}>{grand}</Text>
          </View>
          {totals.map((st, i) => (
            <StatBar key={st.name} name={st.name} value={st.value} max={255 * team.length} delay={i * 70} />
          ))}
        </HardBox>
      )}

      {team.length > 0 && <Text style={[s.mLabel, { marginTop: 20, marginBottom: 6 }]}>ROSTER</Text>}
    </View>
  );

  return (
    <Screen>
      <Header kicker="SQUAD ROSTER" title={`${STUDENT_NAME}'s Team`} sticker={`${team.length}/${MAX_TEAM}`} />
      <FlatList
        data={team}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty title="No team yet" text="Open any Pokémon and tap “Add to team”. Your squad is saved on this phone." />}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <HardBox style={{ marginBottom: 6 }} onPress={() => navigation.navigate('Detail', { id: item.id })} contentStyle={s.row}>
            <View style={[s.thumb, { backgroundColor: tintFor(item.id) }]}>
              <Image source={{ uri: sprite(item.id) }} style={{ width: 56, height: 56 }} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.name}>{prettyName(item.name)}</Text>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>{item.types.map((t) => <TypeChip key={t} type={t} />)}</View>
            </View>
            <Pressable onPress={() => remove(item.id)} hitSlop={10} style={s.remove}>
              <Text style={s.removeText}>REMOVE</Text>
            </Pressable>
          </HardBox>
        )}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  slots: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  slotWrap: { width: '33.333%', padding: 4 },
  slot: {
    aspectRatio: 1, borderWidth: 3, borderColor: C.ink, borderStyle: 'dashed', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  plus: { fontFamily: F.mono, fontSize: 26, fontWeight: '900', color: C.ink, opacity: 0.3 },
  statHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mLabel: { fontFamily: F.mono, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: C.ink, opacity: 0.65 },
  grand: { fontFamily: F.serif, fontSize: 28, fontWeight: '900', color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  thumb: { width: 64, height: 64, borderRadius: 10, borderWidth: 2.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: F.serif, fontSize: 18, fontWeight: '900', color: C.ink },
  remove: { borderWidth: 2.5, borderColor: C.ink, borderRadius: 8, backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 6 },
  removeText: { fontFamily: F.mono, fontSize: 10, fontWeight: '900', color: C.ink },
});
