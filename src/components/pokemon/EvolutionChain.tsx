'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { EvolutionStage } from '@/types/pokemon';
import { formatPokemonName } from '@/utils/formatters';
import { isLinearChain } from '@/utils/evolution-helpers';

interface EvolutionChainProps {
  chain: EvolutionStage;
  currentPokemonId: number;
}

export default function EvolutionChain({ chain, currentPokemonId }: EvolutionChainProps) {
  const linear = isLinearChain(chain);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Evolution Chain</h3>

      {chain.children.length === 0 ? (
        <p className="text-white/30 text-sm">This Pokemon does not evolve.</p>
      ) : linear ? (
        <LinearChain chain={chain} currentId={currentPokemonId} />
      ) : (
        <BranchingChain chain={chain} currentId={currentPokemonId} />
      )}
    </div>
  );
}

function LinearChain({ chain, currentId }: { chain: EvolutionStage; currentId: number }) {
  const stages: EvolutionStage[] = [];
  let current: EvolutionStage | null = chain;
  while (current) {
    stages.push(current);
    current = current.children[0] || null;
  }

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-center gap-2">
          {i > 0 && (
            <div className="flex flex-col items-center gap-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              {stage.triggerDetail && (
                <span className="text-[10px] text-white/30 text-center max-w-[80px] leading-tight">
                  {stage.triggerDetail}
                </span>
              )}
            </div>
          )}
          <EvolutionStageCard stage={stage} isCurrent={stage.id === currentId} />
        </div>
      ))}
    </div>
  );
}

function BranchingChain({ chain, currentId }: { chain: EvolutionStage; currentId: number }) {
  return (
    <div className="flex items-start gap-4">
      {/* Base Pokemon */}
      <div className="flex flex-col items-center">
        <EvolutionStageCard stage={chain} isCurrent={chain.id === currentId} />
      </div>

      {/* Arrow */}
      {chain.children.length > 0 && (
        <div className="flex items-center self-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}

      {/* Branches */}
      <div className="flex flex-col gap-2">
        {chain.children.map(child => (
          <div key={child.id} className="flex items-center gap-2">
            <EvolutionStageCard stage={child} isCurrent={child.id === currentId} />
            {child.triggerDetail && (
              <span className="text-[10px] text-white/30 max-w-[80px] leading-tight">
                {child.triggerDetail}
              </span>
            )}
            {/* Second stage evolutions */}
            {child.children.length > 0 && (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {child.children.map(grandchild => (
                  <EvolutionStageCard key={grandchild.id} stage={grandchild} isCurrent={grandchild.id === currentId} />
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvolutionStageCard({ stage, isCurrent }: { stage: EvolutionStage; isCurrent: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Link
        href={`/pokemon/${stage.id}`}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          isCurrent
            ? 'bg-white/10 ring-2 ring-white/20'
            : 'hover:bg-white/5'
        }`}
      >
        <div className="relative w-16 h-16">
          <Image
            src={stage.spriteUrl}
            alt={stage.name}
            fill
            sizes="64px"
            className="object-contain"
            loading="lazy"
          />
        </div>
        <span className="text-[11px] text-white/60 capitalize">
          {formatPokemonName(stage.name)}
        </span>
      </Link>
    </motion.div>
  );
}
