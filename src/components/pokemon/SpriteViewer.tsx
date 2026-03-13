'use client';

import { useState, useCallback } from 'react';
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

// Scale factor for pixel sprites — 2x natural size, capped to container
const SPRITE_SCALE = 2;
const SPRITE_MAX = 192;

export default function SpriteViewer({ sprites, name }: SpriteViewerProps) {
  const [activeTab, setActiveTab] = useState<SpriteTab>('official');
  const [spriteSize, setSpriteSize] = useState<{ w: number; h: number } | null>(null);

  // Fallback chain for animated: showdown GIF → front default sprite
  const animatedSprite = sprites.showdown || sprites.frontDefault;

  const spriteMap: Record<SpriteTab, string | null> = {
    official: sprites.officialArtwork,
    shiny: sprites.officialArtworkShiny,
    home: sprites.home,
    animated: animatedSprite,
  };

  const isAnimated = activeTab === 'animated';
  const currentSprite = spriteMap[activeTab];

  // Compute display size on load — scale proportionally, cap to max
  const handleSpriteLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    const scaledW = natW * SPRITE_SCALE;
    const scaledH = natH * SPRITE_SCALE;

    // Cap to SPRITE_MAX while preserving aspect ratio
    const maxDim = Math.max(scaledW, scaledH);
    if (maxDim > SPRITE_MAX) {
      const ratio = SPRITE_MAX / maxDim;
      setSpriteSize({ w: Math.round(scaledW * ratio), h: Math.round(scaledH * ratio) });
    } else {
      setSpriteSize({ w: scaledW, h: scaledH });
    }
  }, []);

  // Reset sprite size when switching tabs so it recalculates
  const handleTabChange = (tab: SpriteTab) => {
    if (tab !== activeTab) {
      setSpriteSize(null);
      setActiveTab(tab);
    }
  };

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
            className={`relative flex items-center justify-center ${isAnimated ? '' : 'w-64 h-64'}`}
            style={isAnimated ? { width: SPRITE_MAX, height: SPRITE_MAX } : undefined}
          >
            {currentSprite ? (
              isAnimated ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSprite}
                  alt={`${name} animated`}
                  onLoad={handleSpriteLoad}
                  className="drop-shadow-2xl"
                  style={spriteSize ? {
                    width: spriteSize.w,
                    height: spriteSize.h,
                  } : {
                    // Before natural size is known, hide to prevent flash
                    opacity: 0,
                  }}
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
            onClick={() => handleTabChange(tab.key)}
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
