import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { serviceLines } from '@/lib/content/service-lines';

function PhotoMosaic({ photos, label }: { photos: { src: string; alt: string; badge?: string }[]; label: string }) {
  const shown = photos.slice(0, 4);
  return (
    <div className="grid grid-cols-2 gap-3" aria-label={label}>
      {shown.map((photo, index) => (
        <div key={photo.src} className={`relative aspect-[3/4] overflow-hidden rounded-2xl shadow-soft ${index > 1 ? 'hidden sm:block' : ''}`}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width:1024px) 22vw, 45vw"
            className="object-cover"
          />
          {photo.badge && (
            <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-on-accent">
              {photo.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Tres líneas con fotos reales y el detalle de cada trabajo. */
export function ServiceLines() {
  return (
    <div id="servicios" className="scroll-mt-24">
      {serviceLines.map((line, index) => {
        const onAccent = index % 2 === 1;
        const featured = line.photos.slice(0, 4);
        return (
          <section
            key={line.slug}
            className={onAccent ? 'bg-accent py-16 text-on-accent md:py-24' : 'bg-primary py-16 text-white md:py-24'}
            aria-labelledby={`linea-${line.slug}`}
          >
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
              <Reveal className={index % 2 === 1 ? 'lg:order-2' : ''}>
                {featured.length > 1 ? (
                  <PhotoMosaic photos={featured} label={`Fotos de ${line.title}`} />
                ) : (
                  <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl shadow-soft">
                    <Image
                      src={line.photos[0]!.src}
                      alt={line.photos[0]!.alt}
                      fill
                      sizes="(min-width:1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </Reveal>
              <Reveal delay={80} className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <p className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${onAccent ? 'bg-primary-deep text-white' : 'bg-accent text-on-accent'}`}>
                  0{index + 1}
                </p>
                <h2 id={`linea-${line.slug}`} className="mt-4 text-3xl font-bold md:text-4xl">
                  {line.title}
                </h2>
                <p className={`mt-4 text-lg leading-relaxed ${onAccent ? 'text-on-accent/85' : 'text-white/90'}`}>
                  {line.intro}
                </p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {line.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 rounded-xl bg-white px-3 py-3 text-sm font-medium text-ink shadow-soft">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent" aria-hidden>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/servicios/${line.slug}`}
                  className={`mt-7 inline-flex min-h-11 items-center gap-2 rounded-full px-6 font-semibold shadow-soft transition-transform hover:-translate-y-0.5 ${onAccent ? 'bg-primary-deep text-white' : 'bg-white text-primary'}`}
                >
                  Ver este servicio
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </Reveal>
            </div>
          </section>
        );
      })}
    </div>
  );
}
