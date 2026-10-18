import React, { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { artwork, artworkBackup, sprite } from '../api';
import { C, F } from '../theme';

// Shows the tiny cached sprite (blurred) instantly, then fades the big artwork in
// on top of it once it has downloaded. If the CDN fails, it retries from GitHub.
export default function ProgressiveImage({ id, style }) {
  const [backup, setBackup] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  return (
    <View style={style}>
      <Image source={{ uri: sprite(id) }} style={StyleSheet.absoluteFill} resizeMode="contain" blurRadius={1} />
      <Animated.Image
        source={{ uri: backup ? artworkBackup(id) : artwork(id) }}
        style={[StyleSheet.absoluteFill, { opacity }]}
        resizeMode="contain"
        onLoad={() => {
          setLoaded(true);
          Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        }}
        onError={() => { if (!backup) setBackup(true); }}
      />
      {!loaded && (
        <View style={s.tag}>
          <Text style={s.tagText}>LOADING HD…</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tag: { position: 'absolute', bottom: 8, alignSelf: 'center', backgroundColor: C.ink, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontFamily: F.mono, fontSize: 10, fontWeight: '800', color: C.butter, letterSpacing: 1 },
});
