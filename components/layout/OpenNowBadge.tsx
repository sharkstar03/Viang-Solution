'use client';

import { useEffect, useState } from 'react';
import { isOpenNow } from '@/lib/business-hours';
import type { BusinessHours } from '@/lib/types';

/**
 * Indicador en vivo de disponibilidad. Client component a propósito:
 * las páginas se cachean (ISR) y este estado depende de la hora real
 * del visitante. `now` solo se inyecta en tests.
 */
export function OpenNowBadge({ hours, now }: { hours: BusinessHours; now?: Date }) {
  const [current, setCurrent] = useState<Date | null>(now ?? null);
  useEffect(() => {
    if (!now) setCurrent(new Date());
  }, [now]);

  if (!current) return null; // evita desajuste SSR/cliente
  const { open, nextChange } = isOpenNow(hours, current);

  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
      <span
        aria-hidden
        className={`h-2.5 w-2.5 rounded-full ${open ? 'bg-green-400' : 'bg-amber-400'}`}
      />
      {open ? 'Abierto ahora · respondemos en minutos' : `Te respondemos ${nextChange}`}
    </p>
  );
}
