'use client';

import { createContext, useContext } from 'react';
import { useCaughtPokemon } from '@/hooks/useCaughtPokemon';

type CaughtContextType = ReturnType<typeof useCaughtPokemon>;

const CaughtContext = createContext<CaughtContextType | null>(null);

export function CaughtProvider({ children }: { children: React.ReactNode }) {
  const caught = useCaughtPokemon();
  return <CaughtContext.Provider value={caught}>{children}</CaughtContext.Provider>;
}

export function useCaught() {
  const ctx = useContext(CaughtContext);
  if (!ctx) throw new Error('useCaught must be used within CaughtProvider');
  return ctx;
}
