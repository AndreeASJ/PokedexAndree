// Ultra Beasts — no API flag exists, must be hardcoded
export const ULTRA_BEASTS: ReadonlySet<number> = new Set([
  793,  // Nihilego
  794,  // Buzzwole
  795,  // Pheromosa
  796,  // Xurkitree
  797,  // Celesteela
  798,  // Kartana
  799,  // Guzzlord
  803,  // Poipole
  804,  // Naganadel
  805,  // Stakataka
  806,  // Blacephalon
]);

// Pseudo-legendaries — 600 BST, 3-stage evolution, no API flag
export const PSEUDO_LEGENDARIES: ReadonlySet<number> = new Set([
  149,  // Dragonite
  248,  // Tyranitar
  373,  // Salamence
  376,  // Metagross
  445,  // Garchomp
  635,  // Hydreigon
  706,  // Goodra
  784,  // Kommo-o
  887,  // Dragapult
  998,  // Baxcalibur
]);

export type PokemonClassification =
  | 'legendary'
  | 'mythical'
  | 'ultra-beast'
  | 'pseudo-legendary'
  | 'regular';

export function getClassification(
  id: number,
  isLegendary: boolean,
  isMythical: boolean
): PokemonClassification {
  if (isMythical) return 'mythical';
  if (isLegendary) return 'legendary';
  if (ULTRA_BEASTS.has(id)) return 'ultra-beast';
  if (PSEUDO_LEGENDARIES.has(id)) return 'pseudo-legendary';
  return 'regular';
}

export const CLASSIFICATION_LABELS: Record<PokemonClassification, string> = {
  legendary: 'Legendary',
  mythical: 'Mythical',
  'ultra-beast': 'Ultra Beast',
  'pseudo-legendary': 'Pseudo-Legendary',
  regular: 'Regular',
};

export const CLASSIFICATION_COLORS: Record<PokemonClassification, string> = {
  legendary: '#FFD700',
  mythical: '#FF69B4',
  'ultra-beast': '#00CED1',
  'pseudo-legendary': '#9370DB',
  regular: '#808080',
};
