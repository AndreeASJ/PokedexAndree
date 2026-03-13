'use client';

import { useState } from 'react';
import { useCaught } from '@/providers/CaughtProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface CaughtButtonProps {
  pokemonId: number;
  size?: 'sm' | 'md' | 'lg';
}

// Wobble keyframes: tilt left → right → left → settle
const wobbleAnimation = {
  rotate: [0, -20, 20, -12, 12, -5, 0],
  y: [0, -4, 0, -2, 0, -1, 0],
};

export default function CaughtButton({ pokemonId, size = 'sm' }: CaughtButtonProps) {
  const { isCaught, toggleCaught } = useCaught();
  const caught = isCaught(pokemonId);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeMap = { sm: 22, md: 30, lg: 38 };
  const iconSize = sizeMap[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!caught) {
      // Catching: play wobble then toggle
      setIsAnimating(true);
    } else {
      // Releasing: just toggle immediately
      toggleCaught(pokemonId);
    }
  };

  const handleWobbleComplete = () => {
    setIsAnimating(false);
    toggleCaught(pokemonId);
  };

  // Colors
  const topColor = caught ? '#EE4444' : 'rgba(255,255,255,0.15)';
  const topStroke = caught ? '#CC3333' : 'rgba(255,255,255,0.3)';
  const bottomColor = caught ? '#F5F5F5' : 'rgba(255,255,255,0.05)';
  const bottomStroke = caught ? '#DDDDDD' : 'rgba(255,255,255,0.3)';
  const bandColor = caught ? '#333333' : 'rgba(255,255,255,0.2)';
  const buttonColor = caught ? '#F5F5F5' : 'rgba(255,255,255,0.15)';
  const buttonStroke = caught ? '#333333' : 'rgba(255,255,255,0.3)';
  const buttonInner = caught ? '#333333' : 'rgba(255,255,255,0.1)';

  return (
    <motion.button
      whileTap={!isAnimating ? { scale: 0.85 } : undefined}
      whileHover={!isAnimating ? { scale: 1.15 } : undefined}
      onClick={handleClick}
      className="relative cursor-pointer"
      aria-label={caught ? 'Mark as uncaught' : 'Mark as caught'}
      title={caught ? 'Caught! Click to release' : 'Click to mark as caught'}
    >
      <motion.div
        animate={isAnimating ? wobbleAnimation : { rotate: 0, y: 0 }}
        transition={
          isAnimating
            ? { duration: 0.8, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        onAnimationComplete={isAnimating ? handleWobbleComplete : undefined}
        style={{ originX: 0.5, originY: 0.7 }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Top half (red/empty) */}
          <path
            d="M12 2C6.48 2 2 6.48 2 12h20C22 6.48 17.52 2 12 2Z"
            fill={topColor}
            stroke={topStroke}
            strokeWidth="1.5"
          />
          {/* Bottom half (white/empty) */}
          <path
            d="M12 22c5.52 0 10-4.48 10-10H2c0 5.52 4.48 10 10 10Z"
            fill={bottomColor}
            stroke={bottomStroke}
            strokeWidth="1.5"
          />
          {/* Center band */}
          <rect
            x="2"
            y="11"
            width="20"
            height="2.5"
            fill={bandColor}
            rx="0.5"
          />
          {/* Center button outer */}
          <circle
            cx="12"
            cy="12"
            r="3.5"
            fill={buttonColor}
            stroke={buttonStroke}
            strokeWidth="1.5"
          />
          {/* Center button inner */}
          <circle
            cx="12"
            cy="12"
            r="1.5"
            fill={buttonInner}
          />
        </svg>
      </motion.div>

      {/* Sparkle particles on catch */}
      <AnimatePresence>
        {caught && !isAnimating && (
          <>
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <motion.div
                key={angle}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos((angle * Math.PI) / 180) * 16,
                  y: Math.sin((angle * Math.PI) / 180) * 16,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-yellow-300 pointer-events-none"
                style={{ marginTop: -2, marginLeft: -2 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
