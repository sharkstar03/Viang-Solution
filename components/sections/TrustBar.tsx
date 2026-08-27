import Image from 'next/image';
import type { Client } from '@/lib/types';

/**
 * Prueba social inmediatamente bajo el hero. Marquesina 100% CSS,
 * pausada al hover y desactivada con prefers-reduced-motion.
 */
export function TrustBar({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const loop = [...clients, ...clients]; // duplicado para el loop continuo

  return (
    <section aria-label="Clientes que confían en nosotros" className="border-y border-black/5 bg-surface py-10">
      <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-ink/50">
        Empresas que confían en nosotros
      </p>
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-14 px-7">
          {loop.map((c, i) => (
            <Image
              key={`${c.id}-${i}`}
              src={`/${c.logo_path}`}
              alt={i < clients.length ? c.name : ''}
              aria-hidden={i >= clients.length}
              width={120}
              height={60}
              className="h-12 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
