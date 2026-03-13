'use client';

import { motion } from 'framer-motion';
import type { PokemonStat } from '@/types/pokemon';
import { TYPE_COLORS } from '@/lib/constants/type-colors';

interface StatsRadarProps {
  stats: PokemonStat[];
  primaryType: string;
}

const MAX_STAT = 255;

export default function StatsRadar({ stats, primaryType }: StatsRadarProps) {
  const colors = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const total = stats.reduce((sum, s) => sum + s.baseStat, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Base Stats</h3>
        <span className="text-xs font-mono text-white/40">Total: {total}</span>
      </div>

      <div className="space-y-2">
        {stats.map((stat, i) => {
          const percentage = (stat.baseStat / MAX_STAT) * 100;
          return (
            <div key={stat.name} className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/50 w-8 text-right">
                {stat.label}
              </span>
              <span className="text-xs font-mono text-white/70 w-8 text-right">
                {stat.baseStat}
              </span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full stat-bar"
                  style={{
                    background: `linear-gradient(90deg, ${colors.bg}, ${colors.bg}cc)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
