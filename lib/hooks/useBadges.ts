// lib/hooks/useBadges.ts
import { useMemo } from 'react';
import { evaluateBadges } from '../badges';
import type { MemoryProfile } from '../memory';

export function useBadges(profile: MemoryProfile | null) {
  return useMemo(() => {
    if (!profile) {
      return { unlocked: [] };
    }
    const unlocked = evaluateBadges(profile);
    console.log('[useBadges] Unlocked count:', unlocked.length);
    return { unlocked };
  }, [profile]);
}
