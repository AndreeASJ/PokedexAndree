import type { PokemonClassification } from '@/lib/constants/pokemon-classifications';
import type { FormCategory } from '@/lib/constants/pokemon-forms';

export interface PokemonFormSummary {
  id: number;
  name: string;
  displayName: string;
  category: FormCategory;
  types: string[];
  spriteUrl: string;
}

export interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  spriteUrl: string;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
  isUltraBeast: boolean;
  isPseudo: boolean;
  classification: PokemonClassification;
}

export interface PokemonDetail extends PokemonListItem {
  height: number;
  weight: number;
  baseExperience: number;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  cryUrl: string | null;
  genus: string;
  flavorText: string;
  evolutionChainId: number;
  captureRate: number;
  baseHappiness: number;
  growthRate: string;
  eggGroups: string[];
  genderRate: number;
  color: string;
  forms?: PokemonFormSummary[];
  isForm?: boolean;
  baseSpeciesId?: number;
  formCategory?: FormCategory;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonStat {
  name: string;
  baseStat: number;
  label: string;
}

export interface PokemonSprites {
  officialArtwork: string | null;
  officialArtworkShiny: string | null;
  home: string | null;
  homeShiny: string | null;
  showdown: string | null;
  showdownShiny: string | null;
  frontDefault: string | null;
  frontShiny: string | null;
}

export interface PokemonMove {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
  levelLearnedAt: number;
  learnMethod: string;
}

export interface EvolutionStage {
  id: number;
  name: string;
  spriteUrl: string;
  trigger: string | null;
  triggerDetail: string;
  children: EvolutionStage[];
}

export interface GameEncounter {
  locationArea: string;
  versions: {
    version: string;
    maxChance: number;
    details: {
      method: string;
      chance: number;
      minLevel: number;
      maxLevel: number;
    }[];
  }[];
}

export interface FilterState {
  search: string;
  generation: number | null;
  type: string | null;
  classification: PokemonClassification | null;
  caught: 'all' | 'caught' | 'uncaught';
  sortBy: 'id' | 'name';
  sortOrder: 'asc' | 'desc';
}
