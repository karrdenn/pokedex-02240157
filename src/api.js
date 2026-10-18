// All network calls live here (lab requirement).
const BASE = 'https://pokeapi.co/api/v2';
export const TOTAL = 1025;

// Big artwork: jsDelivr CDN (fast, cached worldwide). GitHub raw is the backup.
const ART_PATH = 'PokeAPI/sprites/%SRC%/sprites/pokemon/other/official-artwork';
export const artwork = (id) =>
  `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`;
export const artworkBackup = (id) =>
  `https://raw.githubusercontent.com/${ART_PATH.replace('%SRC%', 'master')}/${id}.png`;

// Tiny (~96px, a few KB) sprite: used in lists so they load fast
export const sprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// "https://pokeapi.co/api/v2/pokemon/25/" -> 25
const idFromUrl = (url) => parseInt(url.split('/').filter(Boolean).pop(), 10);
const toEntry = (r) => ({ id: idFromUrl(r.url), name: r.name });

export const prettyName = (n) =>
  n.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Server replied with ${res.status}`);
  return res.json();
}

// One page of the list (infinite scroll)
export async function fetchPage(offset, limit = 20) {
  const safeLimit = Math.min(limit, TOTAL - offset);
  if (safeLimit <= 0) return [];
  const data = await getJson(`${BASE}/pokemon?offset=${offset}&limit=${safeLimit}`);
  return data.results.map(toEntry);
}

// All names, fetched once and cached (used by search AND the game)
let namesCache = null;
export async function fetchAllNames() {
  if (namesCache) return namesCache;
  const data = await getJson(`${BASE}/pokemon?limit=${TOTAL}`);
  namesCache = data.results.map(toEntry);
  return namesCache;
}

export async function searchPokemon(text) {
  const all = await fetchAllNames();
  const q = text.trim().toLowerCase();
  return all.filter((p) => p.name.includes(q) || String(p.id) === q);
}

export async function fetchPokemon(id) {
  const d = await getJson(`${BASE}/pokemon/${id}`);
  return {
    id: d.id,
    name: d.name,
    types: d.types.map((t) => t.type.name),
    height: d.height / 10, // decimetres -> metres
    weight: d.weight / 10, // hectograms -> kg
    stats: d.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}
