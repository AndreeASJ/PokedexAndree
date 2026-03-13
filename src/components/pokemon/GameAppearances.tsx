'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameEncounter } from '@/types/pokemon';
import { formatPokemonName } from '@/utils/formatters';

interface GameAppearancesProps {
  encounters: GameEncounter[];
}

export default function GameAppearances({ encounters }: GameAppearancesProps) {
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  if (encounters.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Game Locations</h3>
        <p className="text-white/30 text-sm">No wild encounters. This Pokemon may be obtained through special events, gifts, or evolution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
        Game Locations ({encounters.length})
      </h3>

      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
        {encounters.map(enc => {
          const areaName = formatPokemonName(enc.locationArea.replace(/-area$/, ''));
          const isExpanded = expandedArea === enc.locationArea;

          return (
            <div key={enc.locationArea} className="rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedArea(isExpanded ? null : enc.locationArea)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs text-white/70">{areaName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">{enc.versions.length} games</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-2 space-y-1.5">
                      {enc.versions.map(ver => (
                        <div key={ver.version} className="flex items-center justify-between text-[11px]">
                          <span className="text-white/50 capitalize">{formatPokemonName(ver.version)}</span>
                          <div className="flex items-center gap-3 text-white/30">
                            <span>{ver.maxChance}% chance</span>
                            {ver.details[0] && (
                              <span className="capitalize">{formatPokemonName(ver.details[0].method)}</span>
                            )}
                            {ver.details[0] && (
                              <span>Lv.{ver.details[0].minLevel}-{ver.details[0].maxLevel}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
