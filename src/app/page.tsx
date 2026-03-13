'use client';

import { useState, useEffect } from 'react';
import type { PokemonListItem, FilterState } from '@/types/pokemon';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilteredPokemon } from '@/hooks/useFilteredPokemon';
import { useCaught } from '@/providers/CaughtProvider';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import PokemonGrid from '@/components/pokemon/PokemonGrid';
import PokeballSpinner from '@/components/ui/PokeballSpinner';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  generation: null,
  type: null,
  classification: null,
  caught: 'all',
  sortBy: 'id',
  sortOrder: 'asc',
};

export default function HomePage() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 250);

  const { caughtIds, caughtCount, totalCount } = useCaught();

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Load Pokemon list from static JSON
  useEffect(() => {
    async function loadPokemon() {
      try {
        const res = await fetch(`${BASE_PATH}/data/pokemon-list.json`);
        const data: PokemonListItem[] = await res.json();
        setPokemonList(data);
      } catch (err) {
        console.error('Failed to load Pokemon data:', err);
      }
      setIsLoading(false);
    }
    loadPokemon();
  }, []);

  const filteredPokemon = useFilteredPokemon(pokemonList, filters, caughtIds);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <PokeballSpinner size={64} />
        <p className="text-white/40 text-sm animate-pulse">Loading Pokemon...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar value={searchInput} onChange={setSearchInput} />

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        caughtCount={caughtCount}
        totalCount={totalCount}
        resultCount={filteredPokemon.length}
      />

      {/* Grid */}
      <PokemonGrid pokemon={filteredPokemon} isLoading={false} />
    </div>
  );
}
