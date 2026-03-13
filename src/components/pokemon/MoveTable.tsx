'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PokemonMove } from '@/types/pokemon';
import { TYPE_COLORS } from '@/lib/constants/type-colors';
import { formatMoveName } from '@/utils/formatters';

interface MoveTableProps {
  moves: PokemonMove[];
}

type MoveFilter = 'all' | 'level-up' | 'machine' | 'egg' | 'tutor';

const FILTERS: { key: MoveFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'level-up', label: 'Level Up' },
  { key: 'machine', label: 'TM/HM' },
  { key: 'egg', label: 'Egg' },
  { key: 'tutor', label: 'Tutor' },
];

export default function MoveTable({ moves }: MoveTableProps) {
  const [filter, setFilter] = useState<MoveFilter>('all');
  const [expanded, setExpanded] = useState(false);

  const filteredMoves = useMemo(() => {
    let result = moves;
    if (filter !== 'all') {
      result = result.filter(m => m.learnMethod === filter);
    }
    // Sort: level-up moves by level, others by name
    result = [...result].sort((a, b) => {
      if (a.learnMethod === 'level-up' && b.learnMethod === 'level-up') {
        return a.levelLearnedAt - b.levelLearnedAt;
      }
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [moves, filter]);

  const displayMoves = expanded ? filteredMoves : filteredMoves.slice(0, 15);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Moves ({filteredMoves.length})
        </h3>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === f.key
                ? 'bg-white/15 text-white'
                : 'text-white/30 hover:text-white/50 hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 uppercase tracking-wider">
              <th className="text-left py-2 px-2 font-medium">Move</th>
              <th className="text-left py-2 px-2 font-medium">Type</th>
              <th className="text-center py-2 px-2 font-medium">Cat.</th>
              <th className="text-right py-2 px-2 font-medium">Pwr</th>
              <th className="text-right py-2 px-2 font-medium">Acc</th>
              <th className="text-right py-2 px-2 font-medium">PP</th>
              {filter !== 'all' && filter === 'level-up' && (
                <th className="text-right py-2 px-2 font-medium">Lvl</th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayMoves.map((move, i) => {
                const colors = TYPE_COLORS[move.type] || TYPE_COLORS.normal;
                return (
                  <motion.tr
                    key={`${move.name}-${move.learnMethod}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2 px-2 text-white/80">{formatMoveName(move.name)}</td>
                    <td className="py-2 px-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{ backgroundColor: colors.bg + '30', color: colors.bg }}
                      >
                        {move.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-white/50 capitalize">
                      {move.damageClass === 'physical' ? '⚔️' : move.damageClass === 'special' ? '✨' : '📊'}
                    </td>
                    <td className="py-2 px-2 text-right text-white/60 font-mono">
                      {move.power ?? '—'}
                    </td>
                    <td className="py-2 px-2 text-right text-white/60 font-mono">
                      {move.accuracy ? `${move.accuracy}%` : '—'}
                    </td>
                    <td className="py-2 px-2 text-right text-white/60 font-mono">
                      {move.pp ?? '—'}
                    </td>
                    {filter === 'level-up' && (
                      <td className="py-2 px-2 text-right text-white/40 font-mono">
                        {move.levelLearnedAt || '—'}
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Show more/less */}
      {filteredMoves.length > 15 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer"
        >
          {expanded ? 'Show less' : `Show all ${filteredMoves.length} moves`}
        </button>
      )}
    </div>
  );
}
