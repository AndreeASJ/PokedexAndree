'use client';

import { useCaught } from '@/providers/CaughtProvider';
import { motion } from 'framer-motion';

interface CaughtButtonProps {
  pokemonId: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CaughtButton({ pokemonId, size = 'sm' }: CaughtButtonProps) {
  const { isCaught, toggleCaught } = useCaught();
  const caught = isCaught(pokemonId);

  const sizeMap = { sm: 20, md: 28, lg: 36 };
  const iconSize = sizeMap[size];

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.15 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCaught(pokemonId);
      }}
      className="relative group cursor-pointer"
      aria-label={caught ? 'Mark as uncaught' : 'Mark as caught'}
      title={caught ? 'Caught! Click to release' : 'Click to mark as caught'}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        className="transition-colors duration-200"
      >
        {/* Pokeball shape */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={caught ? '#EE8130' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2"
          fill={caught ? 'rgba(238,129,48,0.2)' : 'transparent'}
        />
        <line
          x1="2"
          y1="12"
          x2="22"
          y2="12"
          stroke={caught ? '#EE8130' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke={caught ? '#EE8130' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2"
          fill={caught ? '#EE8130' : 'transparent'}
        />
      </svg>
      {caught && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-[#0f0f1a]"
        />
      )}
    </motion.button>
  );
}
