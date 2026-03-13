import type {
  PokeAPIPokemon,
  PokeAPIPokemonSpecies,
  PokeAPIEvolutionChain,
  PokeAPIMove,
  PokeAPIEncounter,
} from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status} ${url}`);
  return res.json();
}

export async function fetchPokemon(idOrName: number | string): Promise<PokeAPIPokemon> {
  return fetchJson<PokeAPIPokemon>(`${BASE_URL}/pokemon/${idOrName}`);
}

export async function fetchPokemonSpecies(idOrName: number | string): Promise<PokeAPIPokemonSpecies> {
  return fetchJson<PokeAPIPokemonSpecies>(`${BASE_URL}/pokemon-species/${idOrName}`);
}

export async function fetchEvolutionChain(chainId: number): Promise<PokeAPIEvolutionChain> {
  return fetchJson<PokeAPIEvolutionChain>(`${BASE_URL}/evolution-chain/${chainId}`);
}

export async function fetchMove(idOrName: number | string): Promise<PokeAPIMove> {
  return fetchJson<PokeAPIMove>(`${BASE_URL}/move/${idOrName}`);
}

export async function fetchEncounters(pokemonId: number): Promise<PokeAPIEncounter[]> {
  return fetchJson<PokeAPIEncounter[]>(`${BASE_URL}/pokemon/${pokemonId}/encounters`);
}

export async function fetchPokemonList(limit = 1025, offset = 0) {
  return fetchJson<{ count: number; results: { name: string; url: string }[] }>(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );
}
