import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import type { Service } from '@/lib/types';

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="servicios" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">Nuestros servicios</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink/60">
            Un solo proveedor para dejar su espacio impecable, por dentro y por fuera.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 80}>
              <Link
                href={`/servicios/${s.slug}`}
                className="group block overflow-hidden rounded-card bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {s.image_path && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={`/${s.image_path}`}
                      alt={s.title}
                      fill
                      quality={55}
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold group-hover:text-primary-light">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.short_description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-light">
                    Ver más
                    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
