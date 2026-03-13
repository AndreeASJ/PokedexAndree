'use client';

import { TYPE_COLORS } from '@/lib/constants/type-colors';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <span
      className={`inline-block rounded-full font-semibold uppercase tracking-wider ${sizeClasses[size]}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      {type}
    </span>
  );
}
