'use client';

import Link from 'next/link';
import { useCaught } from '@/providers/CaughtProvider';

export default function Header() {
  const { caughtCount, totalCount } = useCaught();
  const progress = totalCount > 0 ? (caughtCount / totalCount) * 100 : 0;

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Pokeball logo */}
          <div className="relative w-8 h-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:rotate-180 duration-500">
              <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" fill="#EE8130" />
              <path d="M12 12a10 10 0 0 1-10 0h20a10 10 0 0 1-10 0z" fill="white" />
              <rect x="2" y="11" width="20" height="2" fill="#333" />
              <circle cx="12" cy="12" r="4" fill="white" stroke="#333" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" fill="#333" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Poke<span className="text-[#EE8130]">Dex</span>
            </h1>
          </div>
        </Link>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Completion</span>
            <span className="text-xs font-mono text-white/60">
              {caughtCount}/{totalCount}
            </span>
          </div>
          <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
