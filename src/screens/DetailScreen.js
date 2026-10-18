import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import HardBox from '../components/HardBox';
import StatBar from '../components/StatBar';
import TypeChip from '../components/TypeChip';
import ProgressiveImage from '../components/ProgressiveImage';
import { ErrorView, Loading } from '../components/StateViews';
import { artwork, fetchPokemon, prettyName } from '../api';
import { MAX_TEAM, useTeam } from '../TeamContext';
import { C, F, TYPE_COLORS, tintFor } from '../theme';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params; // id arrives through route params
  const { team, has, add, remove, isFull } = useTeam();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPokemon(id)
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); Image.prefetch(artwork(id)).catch(() => {}); }, [load, id]);

  const inTeam = has(id);
  const blocked = isFull && !inTeam; // team full -> add button disabled
  const heroColor = data ? TYPE_COLORS[data.types[0]] || tintFor(id) : tintFor(id);
  const total = data ? data.stats.reduce((sum, st) => sum + st.value, 0) : 0;

  return (
    <Screen>
      <View style={s.topRow}>
        <HardBox onPress={() => navigation.goBack()} contentStyle={s.backBtn} shadow={3}>
          <Text style={s.backText}>‹ BACK</Text>
        </HardBox>
        <Text style={s.no}>No.{String(id).padStart(4, '0')}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <HardBox color={heroColor}>
          <ProgressiveImage id={id} style={s.hero} />
        </HardBox>

        {loading ? (
          <Loading label="Reading the field notes…" />
        ) : error ? (
          <ErrorView message={error} onRetry={load} />
        ) : (
          <>
          <Text style={s.name}>{prettyName(data.name)}</Text>
          <View style={s.chips}>{data.types.map((t) => <TypeChip key={t} type={t} />)}</View>

          <View style={s.measureRow}>
            <HardBox style={{ flex: 1, marginRight: 8 }} contentStyle={s.measure}>
              <Text style={s.mLabel}>HEIGHT</Text>
              <Text style={s.mValue}>{data.height.toFixed(1)} m</Text>
            </HardBox>
            <HardBox style={{ flex: 1 }} contentStyle={s.measure}>
              <Text style={s.mLabel}>WEIGHT</Text>
              <Text style={s.mValue}>{data.weight.toFixed(1)} kg</Text>
            </HardBox>
          </View>

          <HardBox contentStyle={{ padding: 14 }} style={{ marginTop: 14 }}>
            <View style={s.statHead}>
              <Text style={s.mLabel}>BASE STATS</Text>
              <Text style={s.mLabel}>TOTAL {total}</Text>
            </View>
            {data.stats.map((st, i) => <StatBar key={st.name} name={st.name} value={st.value} delay={i * 80} />)}
          </HardBox>

          <HardBox
            onPress={() => (inTeam ? remove(id) : add(data))}
            disabled={blocked}
            color={blocked ? C.paperDark : inTeam ? C.card : C.accent}
            style={{ marginTop: 18 }}
            contentStyle={s.teamBtn}
          >
            <Text style={[s.teamText, blocked && { opacity: 0.5 }]}>
              {blocked ? `TEAM FULL (${team.length}/${MAX_TEAM})` : inTeam ? '− REMOVE FROM TEAM' : '+ ADD TO TEAM'}
            </Text>
          </HardBox>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  backText: { fontFamily: F.mono, fontWeight: '800', fontSize: 13, color: C.ink },
  no: { fontFamily: F.mono, fontWeight: '800', fontSize: 14, color: C.ink },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  hero: { width: '100%', height: 270 },
  name: { fontFamily: F.serif, fontSize: 40, fontWeight: '900', color: C.ink, marginTop: 16, letterSpacing: -1 },
  chips: { flexDirection: 'row', marginTop: 8, marginBottom: 14 },
  measureRow: { flexDirection: 'row' },
  measure: { padding: 12 },
  mLabel: { fontFamily: F.mono, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: C.ink, opacity: 0.65 },
  mValue: { fontFamily: F.serif, fontSize: 24, fontWeight: '900', color: C.ink, marginTop: 2 },
  statHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  teamBtn: { paddingVertical: 16, alignItems: 'center' },
  teamText: { fontFamily: F.mono, fontWeight: '900', fontSize: 15, letterSpacing: 1, color: C.ink },
});
