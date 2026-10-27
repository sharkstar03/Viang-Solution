import Image from 'next/image';
import type { Client } from '@/lib/types';

export function TrustBar({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const loop = [...clients, ...clients];

  return (
    <section id="clientes" aria-label="Clientes que confían en nosotros" className="scroll-mt-24 border-y border-ink/10 bg-marble py-12 text-ink">
      <p className="mb-8 text-center font-sans text-xs uppercase tracking-[0.28em] text-ink/60">
        Empresas que confían en nosotros
      </p>
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-16 px-8">
          {loop.map((client, index) => (
            <Image
              key={`${client.id}-${index}`}
              src={`/${client.logo_path}`}
              alt={index < clients.length ? client.name : ''}
              aria-hidden={index >= clients.length}
              width={140}
              height={48}
              className="h-10 w-[8.5rem] object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
