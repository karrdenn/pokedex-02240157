import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import HardBox from './HardBox';
import { sprite, prettyName } from '../api';
import { C, F, tintFor } from '../theme';

// Reusable "specimen card" – used in the Pokédex list and in search results.
export default function PokemonCard({ id, name, inTeam, onPress }) {
  return (
    <HardBox onPress={onPress} color={tintFor(id)}>
      <View style={s.top}>
        <Text style={s.no}>No.{String(id).padStart(4, '0')}</Text>
        {inTeam ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>IN TEAM</Text>
          </View>
        ) : null}
      </View>
      <Image source={{ uri: sprite(id) }} style={s.img} resizeMode="contain" />
      <View style={s.label}>
        <Text numberOfLines={1} style={s.name}>{prettyName(name)}</Text>
      </View>
    </HardBox>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  no: { fontFamily: F.mono, fontWeight: '800', fontSize: 11, color: C.ink },
  badge: { backgroundColor: C.ink, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontFamily: F.mono, fontSize: 9, fontWeight: '800', color: C.butter },
  img: { width: '100%', height: 110, marginBottom: 6, opacity: 0.98 },
  label: { backgroundColor: C.card, borderTopWidth: 3, borderTopColor: C.ink, paddingVertical: 8, paddingHorizontal: 8 },
  name: { fontFamily: F.serif, fontWeight: '900', fontSize: 15, color: C.ink, textAlign: 'center' },
});
