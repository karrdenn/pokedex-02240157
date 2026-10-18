import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pokedex_team_v1';
export const MAX_TEAM = 6;
const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved team once when the app starts
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setTeam(JSON.parse(raw));
      } catch (e) {
        console.warn('Could not read team', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save every change (but only after the first load, so we never overwrite with [])
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(team)).catch((e) => console.warn('Could not save team', e));
  }, [team, loaded]);

  const has = useCallback((id) => team.some((p) => p.id === id), [team]);

  const add = useCallback((p) => {
    setTeam((prev) => {
      if (prev.length >= MAX_TEAM || prev.some((m) => m.id === p.id)) return prev; // full or duplicate
      return [...prev, { id: p.id, name: p.name, types: p.types, stats: p.stats }];
    });
  }, []);

  const remove = useCallback((id) => setTeam((prev) => prev.filter((p) => p.id !== id)), []);

  return (
    <TeamContext.Provider value={{ team, loaded, has, add, remove, isFull: team.length >= MAX_TEAM }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
