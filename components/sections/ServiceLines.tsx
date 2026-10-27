import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { LineIcon } from '@/components/ui/line-icons';
import { serviceLines } from '@/lib/content/service-lines';

const icons = ['floor', 'clean', 'install'] as const;

export function ServiceLines() {
  return (
    <div id="servicios" className="scroll-mt-24">
      {serviceLines.map((line, index) => {
        const dark = index === 1;
        return (
          <section
            key={line.slug}
            aria-labelledby={`linea-${line.slug}`}
            className={dark ? 'bg-primary py-20 text-white md:py-28' : 'bg-marble py-20 text-ink md:py-28'}
          >
            <div className="mx-auto max-w-6xl px-5">
              <Reveal>
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.28em] text-accent">
                      <LineIcon name={icons[index] ?? 'floor'} className="h-4 w-4" />
                      0{index + 1}
                    </p>
                    <h2 id={`linea-${line.slug}`} className="mt-4 max-w-xl text-4xl leading-none md:text-6xl">
                      {line.title}
                    </h2>
                  </div>
                  <Link
                    href={`/servicios/${line.slug}`}
                    className={`hidden min-h-11 items-center border px-5 text-sm tracking-wide md:inline-flex ${dark ? 'border-white/30 hover:bg-white/10' : 'border-ink/20 hover:border-ink'}`}
                  >
                    Ver este servicio
                  </Link>
                </div>
                <p className={`mt-6 max-w-2xl text-base leading-relaxed md:text-lg ${dark ? 'text-white/75' : 'text-ink/75'}`}>
                  {line.intro}
                </p>
              </Reveal>

              <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {line.photos.map((photo) => (
                  <figure key={photo.src} className="relative aspect-[4/5] w-[78%] max-w-sm shrink-0 snap-center overflow-hidden bg-primary-deep shadow-[0_22px_40px_rgb(12_15_20/0.18)] sm:w-[46%] lg:w-[31%]">
                    <Image src={photo.src} alt={photo.alt} fill sizes="(min-width:1024px) 30vw, 78vw" className="object-cover" />
                  </figure>
                ))}
              </div>

              <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
                {line.bullets.map((item) => (
                  <li key={item} className={`flex min-h-11 items-center gap-4 border-t py-3 text-sm ${dark ? 'border-white/15' : 'border-ink/10'}`}>
                    <span className="h-px w-6 bg-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/servicios/${line.slug}`}
                className={`mt-8 inline-flex min-h-11 items-center border px-5 text-sm md:hidden ${dark ? 'border-white/30' : 'border-ink/20'}`}
              >
                Ver este servicio
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
}
