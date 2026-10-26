import Link from 'next/link';
import { waLink } from '@/lib/whatsapp';

/** Losa fotográfica en perspectiva. El archivo es un trabajo real, no stock. */
export function Hero({ whatsapp }: { whatsapp: string }) {
  return (
    <section className="relative overflow-hidden bg-primary-deep text-white">
      <div className="mx-auto grid min-h-[100svh] max-w-6xl items-end gap-6 px-5 pb-32 pt-24 md:grid-cols-12 md:items-center md:gap-10 md:pb-20 md:pt-28">
        <div className="hero-stage md:col-span-6 md:col-start-7" aria-hidden>
          <div className="hero-slab" />
          <div className="hero-plane">
            {/* Plano 3D: img directo. next/image envuelve y pelea con el transform. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/obras/hero.webp"
              alt=""
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="hero-copy relative z-10 md:col-span-6 md:col-start-1 md:row-start-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accent">
            Viangsolutions & Services
          </p>
          <h1 className="mt-5 max-w-xl text-[2.65rem] leading-[0.96] text-white sm:text-6xl md:text-7xl">
            Transformamos y preservamos el valor de sus espacios
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/78 md:text-lg">
            Mármol, travertino, madera y concreto. Limpieza de obra, fachadas e instalaciones
            para residencias y comercios en Panamá.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink(whatsapp, 'Hola, quiero cotizar un servicio')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center bg-white px-7 text-sm font-medium tracking-wide text-ink transition-transform active:scale-[0.98]"
            >
              Cotice sin compromiso
              <span className="sr-only"> por WhatsApp</span>
            </a>
            <Link
              href="/#servicios"
              className="inline-flex min-h-12 items-center justify-center border border-white/40 px-7 text-sm font-medium tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Ver servicios
            </Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.18em] text-white/70">
            20 años en el mercado
            <span className="mx-3 text-accent">/</span>
            Atención en todo Panamá
            <span className="mx-3 text-accent">/</span>
            Aceptamos Visa y Mastercard
          </p>
        </div>
      </div>
    </section>
  );
}
