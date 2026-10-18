import { Platform } from 'react-native';

// "Field Journal" theme: cream paper, ink-black outlines, hard offset shadows,
// one loud persimmon accent (the personal theme colour).
export const C = {
  paper: '#F3EAD7',
  paperDark: '#E4D7BA',
  card: '#FFFBF2',
  ink: '#17140F',
  accent: '#FF5B3A', // <- your theme colour, change freely
  butter: '#FFD35C',
  mint: '#7BD9A8',
  good: '#2FBF71',
  bad: '#E5484D',
};

export const F = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const BORDER = 3;
export const SHADOW = 4;

export const TYPE_COLORS = {
  normal: '#C9C2A8', fire: '#FF8A4C', water: '#5AA9FF', electric: '#FFD93D',
  grass: '#6FD36B', ice: '#9BE7F0', fighting: '#E8604C', poison: '#B77BE0',
  ground: '#D9B26A', flying: '#A9B8FF', psychic: '#FF7FB0', bug: '#B5D53C',
  rock: '#BFA66B', ghost: '#8F7BC8', dragon: '#7A6BFF', dark: '#8C7B6B',
  steel: '#A8B8C4', fairy: '#FFB3D9',
};

const TINTS = ['#FFD9C9', '#CFF1DD', '#CFE4FF', '#FFE9A8', '#E8D9FF', '#FFD0DE'];
export const tintFor = (id) => TINTS[id % TINTS.length];

export const STAT_LABELS = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
};
