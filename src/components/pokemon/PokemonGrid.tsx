'use client';

import type { PokemonListItem } from '@/types/pokemon';
import PokemonCard from './PokemonCard';
import SkeletonCard from '../ui/SkeletonCard';

interface PokemonGridProps {
  pokemon: PokemonListItem[];
  isLoading?: boolean;
}

export default function PokemonGrid({ pokemon, isLoading }: PokemonGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-4 opacity-30">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
        <p className="text-lg font-medium">No Pokemon found</p>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {pokemon.map((p, i) => (
        <PokemonCard key={p.id} pokemon={p} index={i} />
      ))}
    </div>
  );
}
