'use client';

import { motion } from 'framer-motion';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface CryButtonProps {
  cryUrl: string | null;
  name: string;
}

export default function CryButton({ cryUrl, name }: CryButtonProps) {
  const { play, stop, isPlaying, isLoading } = useAudioPlayer();

  if (!cryUrl) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => {
        if (isPlaying) {
          stop();
        } else {
          play(cryUrl);
        }
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
        isPlaying
          ? 'bg-[#EE8130]/20 text-[#EE8130] border border-[#EE8130]/30'
          : 'glass text-white/60 hover:text-white/80'
      }`}
      aria-label={`Play ${name} cry`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
      {isPlaying ? 'Playing...' : 'Play Cry'}
    </motion.button>
  );
}
