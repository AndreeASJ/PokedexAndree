'use client';

import { useState, useEffect, useCallback } from 'react';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'pokedex-caught';
const STORE_NAME = 'caught';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export function useCaughtPokemon() {
  const [caughtIds, setCaughtIds] = useState<Set<number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadCaught() {
      try {
        const db = await getDB();
        const all = await db.getAll(STORE_NAME);
        setCaughtIds(new Set(all.map((item: { id: number }) => item.id)));
      } catch {
        // IndexedDB unavailable, fall back to empty
      }
      setIsLoaded(true);
    }
    loadCaught();
  }, []);

  const toggleCaught = useCallback(async (id: number) => {
    try {
      const db = await getDB();
      const existing = await db.get(STORE_NAME, id);

      if (existing) {
        await db.delete(STORE_NAME, id);
        setCaughtIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await db.put(STORE_NAME, { id, caughtAt: new Date().toISOString() });
        setCaughtIds(prev => new Set(prev).add(id));
      }
    } catch {
      // Silently fail if IndexedDB unavailable
    }
  }, []);

  const isCaught = useCallback((id: number) => caughtIds.has(id), [caughtIds]);

  return {
    caughtIds,
    isCaught,
    toggleCaught,
    caughtCount: caughtIds.size,
    totalCount: 1025,
    isLoaded,
  };
}
