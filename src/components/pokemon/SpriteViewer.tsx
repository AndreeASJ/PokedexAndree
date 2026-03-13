'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { PokemonSprites } from '@/types/pokemon';

interface SpriteViewerProps {
  sprites: PokemonSprites;
  name: string;
}

type SpriteTab = 'official' | 'shiny' | 'home' | 'animated';

const TABS: { key: SpriteTab; label: string }[] = [
  { key: 'official', label: 'Official' },
  { key: 'shiny', label: 'Shiny' },
  { key: 'home', label: '3D' },
  { key: 'animated', label: 'Animated' },
];

export default function SpriteViewer({ sprites, name }: SpriteViewerProps) {
  const [activeTab, setActiveTab] = useState<SpriteTab>('official');

  const spriteMap: Record<SpriteTab, string | null> = {
    official: sprites.officialArtwork,
    shiny: sprites.officialArtworkShiny,
    home: sprites.home,
    animated: sprites.showdown,
  };

  const currentSprite = spriteMap[activeTab];

  return (
    <div className="space-y-4">
      {/* Sprite display */}
      <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl" />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`relative ${activeTab === 'animated' ? 'w-40 h-40' : 'w-64 h-64'}`}
          >
            {currentSprite ? (
              activeTab === 'animated' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSprite}
                  alt={`${name} animated`}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              ) : (
                <Image
                  src={currentSprite}
                  alt={`${name} ${activeTab}`}
                  fill
                  sizes="256px"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <p>No sprite available</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 justify-center">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
