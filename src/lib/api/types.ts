// PokeAPI raw response types

export interface PokeAPINamedResource {
  name: string;
  url: string;
}

export interface PokeAPIPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: {
    slot: number;
    type: PokeAPINamedResource;
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: PokeAPINamedResource;
  }[];
  abilities: {
    ability: PokeAPINamedResource;
    is_hidden: boolean;
    slot: number;
  }[];
  moves: {
    move: PokeAPINamedResource;
    version_group_details: {
      level_learned_at: number;
      move_learn_method: PokeAPINamedResource;
      version_group: PokeAPINamedResource;
    }[];
  }[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
        front_shiny: string | null;
      };
      home: {
        front_default: string | null;
        front_shiny: string | null;
      };
      showdown: {
        front_default: string | null;
        front_shiny: string | null;
        back_default: string | null;
        back_shiny: string | null;
      };
    };
  };
  cries: {
    latest: string | null;
    legacy: string | null;
  };
  species: PokeAPINamedResource;
  location_area_encounters: string;
}

export interface PokeAPIPokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  growth_rate: PokeAPINamedResource;
  egg_groups: PokeAPINamedResource[];
  color: PokeAPINamedResource;
  shape: PokeAPINamedResource | null;
  habitat: PokeAPINamedResource | null;
  generation: PokeAPINamedResource;
  genera: {
    genus: string;
    language: PokeAPINamedResource;
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: PokeAPINamedResource;
    version: PokeAPINamedResource;
  }[];
  evolution_chain: {
    url: string;
  };
  evolves_from_species: PokeAPINamedResource | null;
  varieties: {
    is_default: boolean;
    pokemon: PokeAPINamedResource;
  }[];
}

export interface PokeAPIEvolutionChain {
  id: number;
  chain: PokeAPIEvolutionNode;
}

export interface PokeAPIEvolutionNode {
  species: PokeAPINamedResource;
  is_baby: boolean;
  evolution_details: PokeAPIEvolutionDetail[];
  evolves_to: PokeAPIEvolutionNode[];
}

export interface PokeAPIEvolutionDetail {
  trigger: PokeAPINamedResource;
  min_level: number | null;
  item: PokeAPINamedResource | null;
  held_item: PokeAPINamedResource | null;
  known_move: PokeAPINamedResource | null;
  known_move_type: PokeAPINamedResource | null;
  location: PokeAPINamedResource | null;
  min_affection: number | null;
  min_beauty: number | null;
  min_happiness: number | null;
  time_of_day: string;
  gender: number | null;
  needs_overworld_rain: boolean;
  party_species: PokeAPINamedResource | null;
  party_type: PokeAPINamedResource | null;
  trade_species: PokeAPINamedResource | null;
  turn_upside_down: boolean;
}

export interface PokeAPIMove {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  type: PokeAPINamedResource;
  damage_class: PokeAPINamedResource;
  effect_entries: {
    effect: string;
    short_effect: string;
    language: PokeAPINamedResource;
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: PokeAPINamedResource;
    version_group: PokeAPINamedResource;
  }[];
}

export interface PokeAPIEncounter {
  location_area: PokeAPINamedResource;
  version_details: {
    version: PokeAPINamedResource;
    max_chance: number;
    encounter_details: {
      chance: number;
      min_level: number;
      max_level: number;
      method: PokeAPINamedResource;
      condition_values: PokeAPINamedResource[];
    }[];
  }[];
}

export interface PokeAPIType {
  id: number;
  name: string;
  damage_relations: {
    double_damage_from: PokeAPINamedResource[];
    double_damage_to: PokeAPINamedResource[];
    half_damage_from: PokeAPINamedResource[];
    half_damage_to: PokeAPINamedResource[];
    no_damage_from: PokeAPINamedResource[];
    no_damage_to: PokeAPINamedResource[];
  };
}
