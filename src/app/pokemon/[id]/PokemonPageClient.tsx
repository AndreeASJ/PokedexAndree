'use client';

import { useEffect, useState } from 'react';
import { fetchPokemon, fetchPokemonSpecies, fetchEvolutionChain, fetchEncounters, fetchMove } from '@/lib/api/pokeapi';
import type { PokeAPIPokemon, PokeAPIPokemonSpecies, PokeAPIEncounter } from '@/lib/api/types';
import type { PokemonDetail, PokemonMove, PokemonFormSummary, EvolutionStage, GameEncounter } from '@/types/pokemon';
import { getClassification } from '@/lib/constants/pokemon-classifications';
import { classifyForm } from '@/lib/constants/pokemon-forms';
import { formatStatName, cleanFlavorText } from '@/utils/formatters';
import { flattenEvolutionChain } from '@/utils/evolution-helpers';
import { getCryUrl } from '@/utils/sprite-urls';
import PokemonDetailView from '@/components/pokemon/PokemonDetail';
import PokeballSpinner from '@/components/ui/PokeballSpinner';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

let formsCache: Record<string, PokemonFormSummary[]> | null = null;

async function loadFormsData(): Promise<Record<string, PokemonFormSummary[]>> {
  if (formsCache) return formsCache;
  try {
    const res = await fetch(`${BASE_PATH}/data/pokemon-forms.json`);
    formsCache = await res.json();
    return formsCache!;
  } catch {
    return {};
  }
}

function transformPokemon(
  pokemon: PokeAPIPokemon,
  species: PokeAPIPokemonSpecies,
  isForm: boolean,
  forms?: PokemonFormSummary[]
): PokemonDetail {
  const flavorEntry = species.flavor_text_entries.find(e => e.language.name === 'en');
  const genusEntry = species.genera.find(g => g.language.name === 'en');
  const evolutionChainId = parseInt(species.evolution_chain.url.replace(/\/$/, '').split('/').pop()!, 10);
  const speciesId = species.id;

  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map(t => t.type.name),
    spriteUrl: pokemon.sprites.other['official-artwork'].front_default || '',
    generation: 0,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    isUltraBeast: false,
    isPseudo: false,
    classification: getClassification(speciesId, species.is_legendary, species.is_mythical),
    height: pokemon.height,
    weight: pokemon.weight,
    baseExperience: pokemon.base_experience,
    abilities: pokemon.abilities.map(a => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    stats: pokemon.stats.map(s => ({
      name: s.stat.name,
      baseStat: s.base_stat,
      label: formatStatName(s.stat.name),
    })),
    sprites: {
      officialArtwork: pokemon.sprites.other['official-artwork'].front_default,
      officialArtworkShiny: pokemon.sprites.other['official-artwork'].front_shiny,
      home: pokemon.sprites.other.home.front_default,
      homeShiny: pokemon.sprites.other.home.front_shiny,
      showdown: pokemon.sprites.other.showdown.front_default,
      showdownShiny: pokemon.sprites.other.showdown.front_shiny,
      frontDefault: pokemon.sprites.front_default,
      frontShiny: pokemon.sprites.front_shiny,
    },
    cryUrl: pokemon.cries?.latest || getCryUrl(pokemon.id),
    genus: genusEntry?.genus || 'Pokemon',
    flavorText: flavorEntry ? cleanFlavorText(flavorEntry.flavor_text) : '',
    evolutionChainId,
    captureRate: species.capture_rate,
    baseHappiness: species.base_happiness,
    growthRate: species.growth_rate.name,
    eggGroups: species.egg_groups.map(g => g.name),
    genderRate: species.gender_rate,
    color: species.color.name,
    forms,
    isForm,
    baseSpeciesId: isForm ? speciesId : undefined,
    formCategory: isForm ? (classifyForm(pokemon.name) ?? undefined) : undefined,
  };
}

function extractBasicMoves(pokemon: PokeAPIPokemon): { name: string; levelLearnedAt: number; learnMethod: string }[] {
  const moves: { name: string; levelLearnedAt: number; learnMethod: string }[] = [];

  for (const moveEntry of pokemon.moves) {
    const latestDetail = moveEntry.version_group_details[moveEntry.version_group_details.length - 1];
    if (!latestDetail) continue;

    moves.push({
      name: moveEntry.move.name,
      levelLearnedAt: latestDetail.level_learned_at,
      learnMethod: latestDetail.move_learn_method.name,
    });
  }

  return moves;
}

async function fetchMoveDetails(
  basicMoves: { name: string; levelLearnedAt: number; learnMethod: string }[]
): Promise<PokemonMove[]> {
  const results: PokemonMove[] = [];

  for (let i = 0; i < basicMoves.length; i += 20) {
    const batch = basicMoves.slice(i, i + 20);
    const details = await Promise.all(
      batch.map(async (m) => {
        try {
          const moveData = await fetchMove(m.name);
          return {
            name: m.name,
            type: moveData.type.name,
            power: moveData.power,
            accuracy: moveData.accuracy,
            pp: moveData.pp,
            damageClass: moveData.damage_class.name,
            levelLearnedAt: m.levelLearnedAt,
            learnMethod: m.learnMethod,
          };
        } catch {
          return {
            name: m.name,
            type: 'normal',
            power: null,
            accuracy: null,
            pp: null,
            damageClass: 'physical',
            levelLearnedAt: m.levelLearnedAt,
            learnMethod: m.learnMethod,
          };
        }
      })
    );
    results.push(...details);
  }

  return results;
}

function transformEncounters(encounters: PokeAPIEncounter[]): GameEncounter[] {
  return encounters.map(enc => ({
    locationArea: enc.location_area.name,
    versions: enc.version_details.map(ver => ({
      version: ver.version.name,
      maxChance: ver.max_chance,
      details: ver.encounter_details.map(det => ({
        method: det.method.name,
        chance: det.chance,
        minLevel: det.min_level,
        maxLevel: det.max_level,
      })),
    })),
  }));
}

interface PokemonPageClientProps {
  pokemonId: number;
}

export default function PokemonPageClient({ pokemonId }: PokemonPageClientProps) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [moves, setMoves] = useState<PokemonMove[]>([]);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionStage | null>(null);
  const [encounters, setEncounters] = useState<GameEncounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Accept base Pokemon (1-1025) and form Pokemon (> 10000)
    const isBaseForm = pokemonId >= 1 && pokemonId <= 1025;
    const isAlternateForm = pokemonId >= 10000;

    if (!pokemonId || (!isBaseForm && !isAlternateForm)) {
      setError('Invalid Pokemon ID');
      setIsLoading(false);
      return;
    }

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch Pokemon data
        const pokemonData = await fetchPokemon(pokemonId);

        // For form Pokemon, extract species ID from species.url
        const speciesUrl = pokemonData.species.url;
        const speciesId = parseInt(speciesUrl.replace(/\/$/, '').split('/').pop()!, 10);

        // Fetch species and forms data in parallel
        const [speciesData, formsData] = await Promise.all([
          fetchPokemonSpecies(speciesId),
          loadFormsData(),
        ]);

        // Get forms for this species
        const speciesForms = formsData[String(speciesId)] || [];

        const isForm = pokemonId >= 10000;
        const detail = transformPokemon(pokemonData, speciesData, isForm, speciesForms);
        setPokemon(detail);

        // Extract basic move info
        const basicMoves = extractBasicMoves(pokemonData);

        // Fetch evolution chain, encounters, and move details in parallel
        const [evoData, encounterData, moveDetails] = await Promise.all([
          fetchEvolutionChain(detail.evolutionChainId).catch(() => null),
          fetchEncounters(pokemonId).catch(() => [] as PokeAPIEncounter[]),
          fetchMoveDetails(basicMoves),
        ]);

        setMoves(moveDetails);

        if (evoData) {
          setEvolutionChain(flattenEvolutionChain(evoData.chain));
        }

        setEncounters(transformEncounters(encounterData as PokeAPIEncounter[]));
      } catch (err) {
        setError('Failed to load Pokemon data');
        console.error(err);
      }

      setIsLoading(false);
    }

    loadPokemon();
  }, [pokemonId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <PokeballSpinner size={64} />
        <p className="text-white/40 text-sm animate-pulse">Loading Pokemon data...</p>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white/50 text-lg">{error || 'Pokemon not found'}</p>
        <a href={`${BASE_PATH}/`} className="text-blue-400 hover:text-blue-300 text-sm">
          Back to Pokedex
        </a>
      </div>
    );
  }

  return (
    <PokemonDetailView
      pokemon={pokemon}
      moves={moves}
      evolutionChain={evolutionChain}
      encounters={encounters}
    />
  );
}
