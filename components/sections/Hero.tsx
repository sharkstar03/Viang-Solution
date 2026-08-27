import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { OpenNowBadge } from '@/components/layout/OpenNowBadge';
import { waLink } from '@/lib/whatsapp';
import type { BusinessHours } from '@/lib/types';

/**
 * Portada: imagen fija premium en todas las pantallas (el LCP — priority).
 * Sin video por decisión del cliente: menos peso, cero distracción.
 */
export function Hero({ whatsapp, hours }: { whatsapp: string; hours: BusinessHours }) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-primary">
      <Image
        src="/img/stock/marble-lobby.jpg"
        alt=""
        fill
        priority
        quality={50}
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/70" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-28 text-center text-white">
        <OpenNowBadge hours={hours} />
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
          Transformamos y preservamos
          <span className="block text-accent">el valor de sus espacios</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85 md:text-xl">
          Soluciones integrales para espacios residenciales y comerciales de alto valor.
          Tratamientos de pisos, limpieza especializada, instalaciones y reparaciones en Panamá.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="whatsapp" size="lg" asChild>
            <a
              href={waLink(whatsapp, 'Hola, me gustaría cotizar un servicio')}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbenos por WhatsApp
            </a>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <a href="/#cotizar">Cotiza sin compromiso</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
