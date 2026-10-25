import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { waLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/icons';

/**
 * Portada a sangre: mármol pulido con vista al mar.
 * El degradado azul cubre solo la zona del texto; la foto queda libre arriba.
 */
export function Hero({ whatsapp }: { whatsapp: string }) {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-primary">
      <Image
        src="/img/trabajos/marmol-vista-mar-1.jpg"
        alt="Piso de mármol blanco pulido que refleja ventanales con vista al mar"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/80 via-40% to-transparent to-75%" />

      <div className="hero-copy relative z-10 mx-auto w-full max-w-5xl px-4 pb-32 pt-32 text-white md:pb-20">
        <p className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-sm font-bold text-on-accent">
          Panamá
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Transformamos y preservamos el valor de sus espacios
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white md:text-xl">
          Mármol, granito y madera. Limpieza de piscinas, galpones y fachadas.
          Instalaciones y reparaciones para residencias y comercios.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="accent" size="lg" asChild>
            <a
              href={waLink(whatsapp, 'Hola, me gustaría cotizar un servicio')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Solicitar cotización
              <span className="sr-only"> por WhatsApp</span>
            </a>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/#servicios">Ver servicios</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
