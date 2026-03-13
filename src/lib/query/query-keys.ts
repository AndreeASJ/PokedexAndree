export const pokemonKeys = {
  all: ['pokemon'] as const,
  list: () => ['pokemon', 'list'] as const,
  detail: (id: number) => ['pokemon', 'detail', id] as const,
  species: (id: number) => ['pokemon', 'species', id] as const,
  evolution: (chainId: number) => ['pokemon', 'evolution', chainId] as const,
  moves: (id: number) => ['pokemon', 'moves', id] as const,
  encounters: (id: number) => ['pokemon', 'encounters', id] as const,
};
