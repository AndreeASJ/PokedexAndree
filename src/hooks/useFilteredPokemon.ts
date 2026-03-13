'use client';

import { useMemo } from 'react';
import type { PokemonListItem, FilterState } from '@/types/pokemon';

export function useFilteredPokemon(
  pokemon: PokemonListItem[],
  filters: FilterState,
  caughtIds: Set<number>
): PokemonListItem[] {
  return useMemo(() => {
    let filtered = pokemon;

    // Search by name or number
    if (filters.search) {
      const search = filters.search.toLowerCase().trim();
      const searchNum = parseInt(search.replace('#', ''), 10);

      filtered = filtered.filter(p => {
        if (!isNaN(searchNum)) return p.id === searchNum;
        return p.name.toLowerCase().includes(search);
      });
    }

    // Filter by generation
    if (filters.generation !== null) {
      filtered = filtered.filter(p => p.generation === filters.generation);
    }

    // Filter by type
    if (filters.type !== null) {
      filtered = filtered.filter(p => p.types.includes(filters.type!));
    }

    // Filter by classification
    if (filters.classification !== null) {
      filtered = filtered.filter(p => p.classification === filters.classification);
    }

    // Filter by caught status
    if (filters.caught === 'caught') {
      filtered = filtered.filter(p => caughtIds.has(p.id));
    } else if (filters.caught === 'uncaught') {
      filtered = filtered.filter(p => !caughtIds.has(p.id));
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const cmp = filters.sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : a.id - b.id;
      return filters.sortOrder === 'desc' ? -cmp : cmp;
    });

    return sorted;
  }, [pokemon, filters, caughtIds]);
}
