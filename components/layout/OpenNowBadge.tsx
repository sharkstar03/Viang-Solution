'use client';

import { useSyncExternalStore } from 'react';
import { isOpenNow } from '@/lib/business-hours';
import type { BusinessHours } from '@/lib/types';

// Distingue servidor (false) de cliente ya hidratado (true) sin setState en
// un efecto: React usa el snapshot del servidor durante la hidratación y
// vuelve a renderizar con el del cliente al terminar.
const subscribe = () => () => {};
const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

/**
 * Indicador en vivo de disponibilidad. Client component a propósito:
 * las páginas se cachean (ISR) y este estado depende de la hora real
 * del visitante. `now` solo se inyecta en tests.
 */
export function OpenNowBadge({ hours, now }: { hours: BusinessHours; now?: Date }) {
  const hydrated = useHydrated();
  const current = now ?? (hydrated ? new Date() : null);

  if (!current) return null; // en el servidor no hay "hora del visitante": evita desajuste SSR/cliente
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
