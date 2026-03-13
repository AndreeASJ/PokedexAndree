'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { GENERATIONS } from '@/lib/constants/generations';
import { TYPE_COLOR_LIST } from '@/lib/constants/type-colors';
import { CLASSIFICATION_LABELS, type PokemonClassification } from '@/lib/constants/pokemon-classifications';
import type { FilterState } from '@/types/pokemon';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
  caughtCount: number;
  totalCount: number;
  resultCount: number;
}

const CLASSIFICATIONS: PokemonClassification[] = [
  'legendary', 'mythical', 'ultra-beast', 'pseudo-legendary',
];

export default function FilterPanel({ filters, onChange, caughtCount, totalCount, resultCount }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters = filters.generation !== null || filters.type !== null ||
    filters.classification !== null || filters.caught !== 'all';

  return (
    <div className="space-y-3">
      {/* Top bar: stats + toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/50">
            <span className="text-white font-semibold">{resultCount}</span> Pokemon
          </span>
          <span className="text-white/30">|</span>
          <span className="text-white/50">
            <span className="text-emerald-400 font-semibold">{caughtCount}</span>/{totalCount} caught
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors glass px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          )}
        </button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4 space-y-4">
              {/* Generation */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Generation</label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.generation === null}
                    onClick={() => onChange({ generation: null })}
                    label="All"
                  />
                  {GENERATIONS.map(gen => (
                    <FilterChip
                      key={gen.id}
                      active={filters.generation === gen.id}
                      onClick={() => onChange({ generation: filters.generation === gen.id ? null : gen.id })}
                      label={gen.label}
                    />
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.type === null}
                    onClick={() => onChange({ type: null })}
                    label="All"
                  />
                  {TYPE_COLOR_LIST.map(type => (
                    <FilterChip
                      key={type}
                      active={filters.type === type}
                      onClick={() => onChange({ type: filters.type === type ? null : type })}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                    />
                  ))}
                </div>
              </div>

              {/* Classification */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Classification</label>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={filters.classification === null}
                    onClick={() => onChange({ classification: null })}
                    label="All"
                  />
                  {CLASSIFICATIONS.map(cls => (
                    <FilterChip
                      key={cls}
                      active={filters.classification === cls}
                      onClick={() => onChange({ classification: filters.classification === cls ? null : cls })}
                      label={CLASSIFICATION_LABELS[cls]}
                    />
                  ))}
                </div>
              </div>

              {/* Caught filter */}
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'caught', 'uncaught'] as const).map(status => (
                    <FilterChip
                      key={status}
                      active={filters.caught === status}
                      onClick={() => onChange({ caught: status })}
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                    />
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Sort by</label>
                  <div className="flex gap-1.5">
                    <FilterChip active={filters.sortBy === 'id'} onClick={() => onChange({ sortBy: 'id' })} label="Number" />
                    <FilterChip active={filters.sortBy === 'name'} onClick={() => onChange({ sortBy: 'name' })} label="Name" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Order</label>
                  <div className="flex gap-1.5">
                    <FilterChip active={filters.sortOrder === 'asc'} onClick={() => onChange({ sortOrder: 'asc' })} label="Asc" />
                    <FilterChip active={filters.sortOrder === 'desc'} onClick={() => onChange({ sortOrder: 'desc' })} label="Desc" />
                  </div>
                </div>
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  onClick={() => onChange({
                    generation: null,
                    type: null,
                    classification: null,
                    caught: 'all',
                    sortBy: 'id',
                    sortOrder: 'asc',
                  })}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
        active
          ? 'bg-white/15 text-white border border-white/20'
          : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10 hover:text-white/60'
      }`}
    >
      {label}
    </button>
  );
}
