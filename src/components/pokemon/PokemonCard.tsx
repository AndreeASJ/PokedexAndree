'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { PokemonListItem } from '@/types/pokemon';
import { TYPE_COLORS } from '@/lib/constants/type-colors';
import { formatPokemonName, formatPokemonId } from '@/utils/formatters';
import TypeBadge from './TypeBadge';
import CaughtButton from './CaughtButton';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  index?: number;
}

export default function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  const colors = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  return (
    <Link href={`/pokemon/${pokemon.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group cursor-pointer"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 280px' }}
      >
        <div
          className="glass rounded-2xl p-4 transition-shadow duration-300 relative overflow-hidden"
          style={{
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${colors.glow}, 0 0 0 1px ${colors.bg}40`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(255,255,255,0.05)';
          }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${colors.bg} 0%, transparent 60%)`,
            }}
          />

          {/* Header row */}
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-mono text-white/40">
              {formatPokemonId(pokemon.id)}
            </span>
            <CaughtButton pokemonId={pokemon.id} />
          </div>

          {/* Sprite */}
          <div className="flex justify-center my-3 relative z-10">
            <div className="relative w-28 h-28">
              <Image
                src={pokemon.spriteUrl}
                alt={pokemon.name}
                fill
                sizes="112px"
                className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          </div>

          {/* Name */}
          <h3 className="text-center text-white font-semibold text-sm mb-2 relative z-10">
            {formatPokemonName(pokemon.name)}
          </h3>

          {/* Type badges */}
          <div className="flex gap-1.5 justify-center relative z-10">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
