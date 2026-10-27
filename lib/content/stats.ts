import type { Stat } from '@/lib/types';

/**
 * Counters only render a real positive figure.
 * The "años de trayectoria" claim was removed on purpose: do not bring it back
 * from an older database row.
 */
export function presentableStats(stats: Stat[]): Stat[] {
  return stats
    .map((s) => ({ ...s, value: Number(s.value) }))
    .filter((s) => Number.isFinite(s.value) && s.value > 0 && !/años de trayectoria/i.test(s.label))
    .sort((a, b) => a.sort_order - b.sort_order);
}
