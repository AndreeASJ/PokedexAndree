export interface Generation {
  id: number;
  label: string;
  region: string;
  range: [number, number];
}

export const GENERATIONS: Generation[] = [
  { id: 1, label: 'Gen I',   region: 'Kanto',  range: [1, 151] },
  { id: 2, label: 'Gen II',  region: 'Johto',  range: [152, 251] },
  { id: 3, label: 'Gen III', region: 'Hoenn',  range: [252, 386] },
  { id: 4, label: 'Gen IV',  region: 'Sinnoh', range: [387, 493] },
  { id: 5, label: 'Gen V',   region: 'Unova',  range: [494, 649] },
  { id: 6, label: 'Gen VI',  region: 'Kalos',  range: [650, 721] },
  { id: 7, label: 'Gen VII', region: 'Alola',  range: [722, 809] },
  { id: 8, label: 'Gen VIII',region: 'Galar',  range: [810, 905] },
  { id: 9, label: 'Gen IX',  region: 'Paldea', range: [906, 1025] },
];

export function getGeneration(pokemonId: number): Generation | undefined {
  return GENERATIONS.find(g => pokemonId >= g.range[0] && pokemonId <= g.range[1]);
}
