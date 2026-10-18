import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Header from '../components/Header';
import HardBox from '../components/HardBox';
import PokemonCard from '../components/PokemonCard';
import { Empty, ErrorView, Loading } from '../components/StateViews';
import { artwork, fetchPage, searchPokemon, TOTAL } from '../api';
import { useTeam } from '../TeamContext';
import { STUDENT_NAME, START_OFFSET } from '../config';
import { C, F } from '../theme';

const PAGE = 20;

export default function PokedexScreen({ navigation }) {
  const { has } = useTeam();

  // ---------- infinite scroll ----------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finished, setFinished] = useState(false);
  const nextOffset = useRef(START_OFFSET);
  const busy = useRef(false); // stops two requests running at once
  const finishedRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (busy.current || finishedRef.current) return;
    busy.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPage(nextOffset.current, PAGE);
      nextOffset.current += PAGE;
      if (nextOffset.current >= TOTAL) {
        finishedRef.current = true;
        setFinished(true);
      }
      // remove duplicates by id
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.filter((p) => !seen.has(p.id))];
      });
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMore(); }, [loadMore]);

  // ---------- debounced search over ALL pokémon ----------
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400); // wait 400ms after typing stops
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) { setResults(null); setSearchError(null); return; }
    let cancelled = false; // ignore answers that arrive late
    setSearching(true);
    setSearchError(null);
    searchPokemon(debounced)
      .then((r) => { if (!cancelled) setResults(r); })
      .catch((e) => { if (!cancelled) setSearchError(e.message || 'Search failed'); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debounced, retryKey]);

  const searchMode = query.trim().length > 0;
  const pending = query.trim() !== debounced;
  const data = searchMode ? results || [] : items;
  const open = (id) => { Keyboard.dismiss(); Image.prefetch(artwork(id)).catch(() => {}); navigation.navigate('Detail', { id }); };

  // ---------- what to show when the list is empty / at the bottom ----------
  const renderEmpty = () => {
    if (searchMode) {
      if (searchError) return <ErrorView message={searchError} onRetry={() => setRetryKey((k) => k + 1)} />;
      if (searching || pending || !results) return <Loading label="Searching every species…" />;
      return <Empty title="Nothing found" text={`No Pokémon matches “${debounced}”.`} />;
    }
    if (error) return <ErrorView message={error} onRetry={loadMore} />;
    return <Loading />;
  };

  const renderFooter = () => {
    if (searchMode) return null;
    if (loading && items.length) return <ActivityIndicator color={C.accent} style={{ margin: 20 }} />;
    if (error && items.length) {
      return (
        <View>
          <ErrorView message={error} onRetry={loadMore} />
        </View>
      );
    }
    if (finished) return <Text style={s.end}>— END OF THE ARCHIVE —</Text>;
    return <View style={{ height: 20 }} />;
  };

  return (
    <Screen>
      <Header
        kicker={`FIELD ARCHIVE · FROM No.${START_OFFSET + 1}`}
        title={`${STUDENT_NAME}'s Pokédex`}
        sticker={`${START_OFFSET + 1}→`}
      />

      <View style={s.searchWrap}>
        <HardBox contentStyle={s.searchBox}>
          <Text style={s.prompt}>{'>_'}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="search all 1025 species…"
            placeholderTextColor="#17140F80"
            style={s.input}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={12}>
              <Text style={s.clear}>✕</Text>
            </Pressable>
          )}
        </HardBox>
        {searchMode && (
          <Text style={s.status}>
            {searching || pending ? 'SEARCHING…' : `${results ? results.length : 0} MATCH${results && results.length === 1 ? '' : 'ES'}`}
          </Text>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={s.cell}>
            <PokemonCard id={item.id} name={item.name} inTeam={has(item.id)} onPress={() => open(item.id)} />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={() => { if (!searchMode) loadMore(); }}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 6 }}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  searchWrap: { paddingHorizontal: 18, paddingBottom: 6 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: C.card },
  prompt: { fontFamily: F.mono, fontWeight: '900', color: C.accent, fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontFamily: F.mono, fontSize: 14, color: C.ink, paddingVertical: 12 },
  clear: { fontFamily: F.mono, fontWeight: '900', fontSize: 16, color: C.ink, paddingLeft: 8 },
  status: { fontFamily: F.mono, fontSize: 10, letterSpacing: 1.5, color: C.ink, opacity: 0.6, marginTop: 6 },
  cell: { width: '50%', padding: 6 },
  end: { fontFamily: F.mono, fontSize: 11, textAlign: 'center', color: C.ink, opacity: 0.6, margin: 24 },
});
