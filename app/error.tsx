'use client';

import { waLink } from '@/lib/whatsapp';
import { PUBLIC_PHONE, PUBLIC_WHATSAPP } from '@/lib/site';

/**
 * Error global. Client component que funciona AUNQUE la base esté caída:
 * los contactos vienen de env vars inlineadas en build, no de la DB.
 * Sin stack traces hacia el visitante.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const whatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || PUBLIC_WHATSAPP;
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || PUBLIC_PHONE;
  return (
    <main className="flex min-h-[70svh] flex-col items-center justify-center bg-primary-deep px-4 pt-24 text-center text-white">
      <h1 className="text-2xl font-bold">Algo salió mal de nuestro lado</h1>
      <p className="mt-2 max-w-md text-white/75">
        Ya estamos en ello. Mientras tanto, puede intentar de nuevo o contactarnos directo.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button onClick={reset} className="min-h-11 rounded-full bg-accent px-6 font-semibold text-on-accent">
          Intentar de nuevo
        </button>
        {whatsapp && (
          <a href={waLink(whatsapp, 'Hola, la página dio un error y quiero información')}
            target="_blank" rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-full bg-whatsapp px-6 font-semibold text-ink">
            WhatsApp
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`}
            className="flex min-h-11 items-center justify-center rounded-full border border-white/50 px-6 font-semibold text-white">
            Llamar
          </a>
        )}
      </div>
    </main>
  );
}
