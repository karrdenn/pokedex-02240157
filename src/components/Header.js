import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, F } from '../theme';

export default function Header({ kicker, title, sticker }) {
  return (
    <View style={s.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={s.kicker}>{kicker}</Text>
        <Text style={s.title} numberOfLines={2}>{title}</Text>
      </View>
      {sticker ? (
        <View style={s.sticker}>
          <Text style={s.stickerText}>{sticker}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8 },
  kicker: { fontFamily: F.mono, fontSize: 11, letterSpacing: 1.5, color: C.ink, opacity: 0.65 },
  title: { fontFamily: F.serif, fontSize: 32, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },
  sticker: {
    backgroundColor: C.accent, borderWidth: 3, borderColor: C.ink, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, transform: [{ rotate: '6deg' }], marginLeft: 8,
  },
  stickerText: { fontFamily: F.mono, fontWeight: '800', fontSize: 12, color: C.ink },
});
