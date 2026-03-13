'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PokemonDetail as PokemonDetailType, PokemonMove, EvolutionStage, GameEncounter } from '@/types/pokemon';
import { TYPE_COLORS } from '@/lib/constants/type-colors';
import { CLASSIFICATION_LABELS, CLASSIFICATION_COLORS, type PokemonClassification } from '@/lib/constants/pokemon-classifications';
import { FORM_CATEGORY_LABELS, FORM_CATEGORY_COLORS, type FormCategory } from '@/lib/constants/pokemon-forms';
import { formatPokemonName, formatPokemonId, formatHeight, formatWeight } from '@/utils/formatters';
import TypeBadge from './TypeBadge';
import CaughtButton from './CaughtButton';
import CryButton from './CryButton';
import SpriteViewer from './SpriteViewer';
import StatsRadar from './StatsRadar';
import EvolutionChain from './EvolutionChain';
import MoveTable from './MoveTable';
import GameAppearances from './GameAppearances';
import FormsSection from './FormsSection';

interface PokemonDetailProps {
  pokemon: PokemonDetailType;
  moves: PokemonMove[];
  evolutionChain: EvolutionStage | null;
  encounters: GameEncounter[];
}

export default function PokemonDetailView({ pokemon, moves, evolutionChain, encounters }: PokemonDetailProps) {
  const primaryType = pokemon.types[0];
  const colors = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const classification = pokemon.classification as PokemonClassification;
  const isForm = pokemon.isForm === true;
  const isBase = pokemon.id >= 1 && pokemon.id <= 1025;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Back button + Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={isForm && pokemon.baseSpeciesId ? `/pokemon/${pokemon.baseSpeciesId}` : '/'}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {isForm ? 'Back to Base Form' : 'Back'}
        </Link>
        {isBase && (
          <div className="flex items-center gap-3">
            {pokemon.id > 1 && (
              <Link href={`/pokemon/${pokemon.id - 1}`} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
            )}
            <span className="text-xs text-white/30 font-mono">{formatPokemonId(pokemon.id)}</span>
            {pokemon.id < 1025 && (
              <Link href={`/pokemon/${pokemon.id + 1}`} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Header section */}
      <div
        className="glass-strong rounded-3xl p-6 relative overflow-hidden"
        style={{
          boxShadow: `0 0 60px ${colors.glow}`,
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors.bg} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Sprite */}
          <SpriteViewer sprites={pokemon.sprites} name={pokemon.name} />

          {/* Right: Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/30 font-mono text-sm">{formatPokemonId(pokemon.id)}</p>
                <h1 className="text-3xl font-bold text-white">
                  {formatPokemonName(pokemon.name)}
                </h1>
                <p className="text-white/40 text-sm mt-1">{pokemon.genus}</p>
              </div>
              <CaughtButton pokemonId={pokemon.id} size="lg" />
            </div>

            {/* Types */}
            <div className="flex gap-2">
              {pokemon.types.map(type => (
                <TypeBadge key={type} type={type} size="lg" />
              ))}
            </div>

            {/* Form category badge */}
            {isForm && pokemon.formCategory && (
              <span
                className="inline-block text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: FORM_CATEGORY_COLORS[pokemon.formCategory as FormCategory] + '20',
                  color: FORM_CATEGORY_COLORS[pokemon.formCategory as FormCategory],
                  border: `1px solid ${FORM_CATEGORY_COLORS[pokemon.formCategory as FormCategory]}40`,
                }}
              >
                {FORM_CATEGORY_LABELS[pokemon.formCategory as FormCategory]}
              </span>
            )}

            {/* Classification badge */}
            {!isForm && classification !== 'regular' && (
              <span
                className="inline-block text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: CLASSIFICATION_COLORS[classification] + '20',
                  color: CLASSIFICATION_COLORS[classification],
                  border: `1px solid ${CLASSIFICATION_COLORS[classification]}40`,
                }}
              >
                {CLASSIFICATION_LABELS[classification]}
              </span>
            )}

            {/* Cry button */}
            <CryButton cryUrl={pokemon.cryUrl} name={pokemon.name} />

            {/* Physical info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Height" value={formatHeight(pokemon.height)} />
              <InfoCard label="Weight" value={formatWeight(pokemon.weight)} />
              <InfoCard label="Base Exp" value={String(pokemon.baseExperience)} />
              <InfoCard label="Catch Rate" value={String(pokemon.captureRate)} />
            </div>

            {/* Abilities */}
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Abilities</p>
              <div className="flex gap-2 flex-wrap">
                {pokemon.abilities.map(ability => (
                  <span
                    key={ability.name}
                    className={`text-xs px-2.5 py-1 rounded-lg ${
                      ability.isHidden
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    {formatPokemonName(ability.name)}
                    {ability.isHidden && <span className="text-[9px] ml-1 opacity-60">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Flavor text */}
            <p className="text-sm text-white/40 leading-relaxed italic">
              &ldquo;{pokemon.flavorText}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Alternate Forms */}
      {pokemon.forms && pokemon.forms.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <FormsSection forms={pokemon.forms} currentPokemonId={pokemon.id} />
        </div>
      )}

      {/* Stats */}
      <div className="glass rounded-2xl p-6">
        <StatsRadar stats={pokemon.stats} primaryType={primaryType} />
      </div>

      {/* Evolution Chain */}
      {evolutionChain && (
        <div className="glass rounded-2xl p-6">
          <EvolutionChain chain={evolutionChain} currentPokemonId={pokemon.id} />
        </div>
      )}

      {/* Moves */}
      <div className="glass rounded-2xl p-6">
        <MoveTable moves={moves} />
      </div>

      {/* Game Appearances */}
      <div className="glass rounded-2xl p-6">
        <GameAppearances encounters={encounters} />
      </div>

      {/* Extra Info */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Growth Rate" value={formatPokemonName(pokemon.growthRate)} />
          <InfoCard label="Base Happiness" value={String(pokemon.baseHappiness)} />
          <InfoCard label="Egg Groups" value={pokemon.eggGroups.map(g => formatPokemonName(g)).join(', ')} />
          <InfoCard
            label="Gender Ratio"
            value={
              pokemon.genderRate === -1
                ? 'Genderless'
                : `${((8 - pokemon.genderRate) / 8 * 100).toFixed(0)}% M / ${(pokemon.genderRate / 8 * 100).toFixed(0)}% F`
            }
          />
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white/70 mt-0.5">{value}</p>
    </div>
  );
}
