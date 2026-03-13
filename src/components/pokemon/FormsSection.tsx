'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { PokemonFormSummary } from '@/types/pokemon';
import { FORM_CATEGORY_COLORS, FORM_CATEGORY_LABELS } from '@/lib/constants/pokemon-forms';
import { TYPE_COLORS } from '@/lib/constants/type-colors';
import TypeBadge from './TypeBadge';

interface FormsSectionProps {
  forms: PokemonFormSummary[];
  currentPokemonId: number;
}

export default function FormsSection({ forms, currentPokemonId }: FormsSectionProps) {
  if (forms.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
        Alternate Forms ({forms.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {forms.map((form, i) => {
          const isCurrent = form.id === currentPokemonId;
          const categoryColor = FORM_CATEGORY_COLORS[form.category];
          const primaryType = form.types[0];
          const typeColors = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

          return (
            <Link key={form.id} href={`/pokemon/${form.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className={`relative rounded-xl p-3 cursor-pointer transition-all ${
                  isCurrent
                    ? 'ring-2 ring-white/30 bg-white/10'
                    : 'glass hover:bg-white/5'
                }`}
                style={{
                  boxShadow: isCurrent ? `0 0 20px ${typeColors.glow}` : undefined,
                }}
              >
                {/* Category badge */}
                <span
                  className="inline-block text-[9px] px-2 py-0.5 rounded-full font-semibold mb-2"
                  style={{
                    backgroundColor: categoryColor + '20',
                    color: categoryColor,
                    border: `1px solid ${categoryColor}40`,
                  }}
                >
                  {FORM_CATEGORY_LABELS[form.category]}
                </span>

                {/* Sprite */}
                <div className="flex justify-center my-2">
                  <div className="relative w-20 h-20">
                    <Image
                      src={form.spriteUrl}
                      alt={form.displayName}
                      fill
                      sizes="80px"
                      className="object-contain drop-shadow-lg"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Name */}
                <p className="text-xs text-center text-white/80 font-medium mb-1.5">
                  {form.displayName}
                </p>

                {/* Types */}
                <div className="flex gap-1 justify-center">
                  {form.types.map(type => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>

                {isCurrent && (
                  <p className="text-[9px] text-center text-white/30 mt-1">Current</p>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
