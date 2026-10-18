import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../components/Screen';
import Header from '../components/Header';
import HardBox from '../components/HardBox';
import { ErrorView, Loading } from '../components/StateViews';
import { artwork, fetchAllNames, prettyName } from '../api';
import { C, F } from '../theme';

const BEST_KEY = '@pokedex_best_streak';
const LETTERS = ['A', 'B', 'C', 'D'];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// answer from the first 151 + 3 wrong options, all shuffled
function makeRound(pool) {
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(pool.filter((p) => p.id !== answer.id)).slice(0, 3);
  return { uid: Date.now() + '-' + Math.random(), answer, options: shuffle([answer, ...wrong]), picked: null, eliminated: [], hintUsed: false };
}

export default function GameScreen() {
  const [pool, setPool] = useState(null);
  const [error, setError] = useState(null);
  const [round, setRound] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const upcoming = useRef(null); // next round, prepared in advance

  const prepareNext = (p) => {
    upcoming.current = makeRound(p);
    Image.prefetch(artwork(upcoming.current.answer.id)).catch(() => {});
  };

  const load = useCallback(() => {
    setError(null);
    fetchAllNames()
      .then((all) => {
        const first151 = all.slice(0, 151);
        setPool(first151);
        setRound(makeRound(first151));
        prepareNext(first151);
      })
      .catch((e) => setError(e.message || 'Failed to load'));
  }, []);

  useEffect(() => {
    load();
    AsyncStorage.getItem(BEST_KEY).then((v) => v && setBest(parseInt(v, 10))).catch(() => {});
  }, [load]);

  const answered = round && round.picked !== null;

  const choose = (opt) => {
    if (answered || round.eliminated.includes(opt.id)) return;
    setRound({ ...round, picked: opt });
    if (opt.id === round.answer.id) {
      const ns = streak + 1;
      setScore((x) => x + 1);
      setStreak(ns);
      if (ns > best) {
        setBest(ns);
        AsyncStorage.setItem(BEST_KEY, String(ns)).catch(() => {});
      }
    } else {
      setStreak(0);
    }
  };

  // ⭐ MY OWN FEATURE: 50/50 hint – removes two wrong answers (once per round)
  const useHint = () => {
    if (answered || round.hintUsed) return;
    const wrong = round.options.filter((o) => o.id !== round.answer.id);
    const gone = shuffle(wrong).slice(0, 2).map((o) => o.id);
    setRound({ ...round, eliminated: gone, hintUsed: true });
  };

  const next = () => {
    setImgReady(false);
    setRound(upcoming.current || makeRound(pool));
    prepareNext(pool);
  };

  if (error) return <Screen><ErrorView message={error} onRetry={load} /></Screen>;
  if (!round) return <Screen><Loading label="Warming up the scanner…" /></Screen>;

  const correct = answered && round.picked.id === round.answer.id;

  return (
    <Screen>
      <Header kicker="SILHOUETTE SCANNER · GEN 1" title="Who's That Pokémon?" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.scores}>
          {[['SCORE', score], ['STREAK', streak], ['BEST', best]].map(([label, val]) => (
            <HardBox key={label} style={{ flex: 1, marginRight: label === 'BEST' ? 0 : 8 }} contentStyle={s.scoreBox} shadow={3}>
              <Text style={s.scoreLabel}>{label}</Text>
              <Text style={s.scoreValue}>{val}</Text>
            </HardBox>
          ))}
        </View>

        <HardBox color={answered ? (correct ? C.mint : '#FFB3A8') : C.butter} style={{ marginTop: 14 }}>
          <View style={s.stage}>
            {/* Two stacked copies of the same (cached) picture:
                1) black silhouette, always tinted
                2) normal colours, invisible until the player answers.
                Swapping opacity avoids iOS keeping a stuck tint colour. */}
            <Image
              key={round.uid + '-sil'}
              source={{ uri: artwork(round.answer.id) }}
              style={[s.img, { tintColor: '#000000' }]}
              resizeMode="contain"
              onLoadEnd={() => setImgReady(true)}
            />
            <Image
              key={round.uid + '-real'}
              source={{ uri: artwork(round.answer.id) }}
              style={[s.img, s.imgTop, { opacity: answered ? 1 : 0 }]}
              resizeMode="contain"
            />
            {!imgReady && <ActivityIndicator style={StyleSheet.absoluteFill} color={C.ink} />}
            {answered && (
              <View style={s.reveal}>
                <Text style={s.revealText}>
                  {correct ? 'Gotcha! ' : 'Oh no… '}It's {prettyName(round.answer.name)}
                </Text>
              </View>
            )}
          </View>
        </HardBox>

        <View style={{ marginTop: 16 }}>
          {round.options.map((opt, i) => {
            const gone = round.eliminated.includes(opt.id);
            let bg = C.card;
            let dim = gone ? 0.3 : 1;
            if (answered) {
              if (opt.id === round.answer.id) bg = C.good;
              else if (opt.id === round.picked.id) bg = C.bad;
              else dim = 0.45;
            }
            return (
              <HardBox
                key={opt.id}
                color={bg}
                onPress={() => choose(opt)}
                disabled={answered || gone}
                style={{ marginBottom: 8, opacity: dim }}
                contentStyle={s.option}
                shadow={3}
              >
                <View style={s.letter}><Text style={s.letterText}>{LETTERS[i]}</Text></View>
                <Text style={[s.optText, gone && { textDecorationLine: 'line-through' }]}>{prettyName(opt.name)}</Text>
              </HardBox>
            );
          })}
        </View>

        {answered ? (
          <HardBox color={C.accent} onPress={next} style={{ marginTop: 8 }} contentStyle={s.actionBtn}>
            <Text style={s.actionText}>NEXT ROUND →</Text>
          </HardBox>
        ) : (
          <HardBox
            color={round.hintUsed ? C.paperDark : C.card}
            onPress={useHint}
            disabled={round.hintUsed}
            style={{ marginTop: 8 }}
            contentStyle={s.actionBtn}
            shadow={3}
          >
            <Text style={[s.actionText, round.hintUsed && { opacity: 0.45 }]}>
              {round.hintUsed ? 'HINT USED' : '💡 50/50 HINT (1 PER ROUND)'}
            </Text>
          </HardBox>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingBottom: 30 },
  scores: { flexDirection: 'row' },
  scoreBox: { paddingVertical: 8, alignItems: 'center' },
  scoreLabel: { fontFamily: F.mono, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: C.ink, opacity: 0.65 },
  scoreValue: { fontFamily: F.serif, fontSize: 26, fontWeight: '900', color: C.ink },
  stage: { height: 260, alignItems: 'center', justifyContent: 'center' },
  img: { width: '90%', height: 240 },
  imgTop: { position: 'absolute' },
  reveal: { position: 'absolute', bottom: 8, backgroundColor: C.ink, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  revealText: { fontFamily: F.mono, fontWeight: '800', fontSize: 13, color: C.butter },
  option: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  letter: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  letterText: { fontFamily: F.mono, fontWeight: '900', color: C.butter },
  optText: { fontFamily: F.serif, fontSize: 18, fontWeight: '900', color: C.ink },
  actionBtn: { paddingVertical: 14, alignItems: 'center' },
  actionText: { fontFamily: F.mono, fontWeight: '900', fontSize: 13, letterSpacing: 1, color: C.ink },
});
