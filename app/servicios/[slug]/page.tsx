import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LineIcon } from '@/components/ui/line-icons';
import { Reveal } from '@/components/ui/Reveal';
import { getServiceBySlug, getServices, getSettings } from '@/lib/content/queries';
import { serviceLineBySlug } from '@/lib/content/service-lines';
import { serviceJsonLd, faqJsonLd } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';

// Solo las rutas de generateStaticParams. `true` no se puede exportar como sitio estático.
export const dynamicParams = false;

const lineIcons: Record<string, string> = {
  sparkles: 'floor',
  droplets: 'clean',
  wrench: 'install',
};

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const line = serviceLineBySlug(slug);
  if (!service && !line) return {};
  return {
    title: line?.title ?? service!.title,
    description: line?.summary ?? service!.short_description,
    alternates: { canonical: `/servicios/${line?.slug ?? service!.slug}` },
  };
}

/** Separa la descripción larga: intro (párrafos) + lista de sub-servicios. */
function splitDescription(text: string): { intro: string[]; items: string[] } {
  const lines = text.split('\n').filter(Boolean);
  return {
    intro: lines.filter((l) => !l.startsWith('- ')),
    items: lines.filter((l) => l.startsWith('- ')).map((l) => l.slice(2)),
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, settings, services] = await Promise.all([
    getServiceBySlug(slug), getSettings(), getServices(),
  ]);
  if (!service) notFound();

  const line = serviceLineBySlug(service.slug);
  const split = splitDescription(service.long_description);
  const intro = line ? [line.intro] : split.intro;
  const items = line ? [...line.bullets] : split.items;
  const title = line?.title ?? service.title;
  const summary = line?.summary ?? service.short_description;
  const cover = line?.cover ?? service.image_path;
  const others = services.filter((s) => s.slug !== service.slug);
  const gallery = line?.photos ?? [];
  const ldService = serviceJsonLd(service, settings);
  const ldFaq = faqJsonLd(service.faq);
  const waHref = waLink(settings.whatsapp, `Hola, me interesa ${title}`);
  const icon = lineIcons[line?.icon ?? service.icon] ?? 'floor';

  return (
    <main className="bg-marble text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldService) }} />
      {ldFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />
      )}

      <section className="bg-primary-deep text-white">
        <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pb-16 pt-28 md:grid-cols-2 md:pt-36">
          <div>
            <p className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.28em] text-accent">
              <LineIcon name={icon} className="h-4 w-4" />
              Servicio
            </p>
            <h1 className="mt-4 max-w-xl text-4xl leading-none md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 md:text-lg">{summary}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center bg-white px-7 text-sm tracking-wide text-ink"
              >
                Cotice sin compromiso
                <span className="sr-only"> por WhatsApp</span>
              </a>
              <Link
                href="/#cotizar"
                className="inline-flex min-h-12 items-center justify-center border border-white/35 px-7 text-sm tracking-wide text-white"
              >
                Completar el formulario
              </Link>
            </div>
          </div>
          {cover && (
            <div className="relative aspect-[4/5] overflow-hidden shadow-[24px_32px_60px_rgb(0_0_0/0.35)]">
              <Image src={`/${cover}`} alt="" fill priority sizes="(min-width:768px) 46vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            {intro.map((p) => (
              <p key={p} className="max-w-3xl text-lg leading-relaxed text-ink/80 md:text-xl">
                {p}
              </p>
            ))}
          </Reveal>
          <ul className="mt-12 grid gap-x-16 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="flex min-h-12 items-center gap-4 border-t border-ink/10 py-3 text-sm">
                <span className="h-px w-6 bg-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-primary py-16 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <p className="font-sans text-xs uppercase tracking-[0.28em] text-accent">Registro</p>
              <h2 className="mt-3 text-4xl leading-none md:text-5xl">En obra</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {gallery.map((img, i) => (
                <Reveal key={img.src} delay={i * 50}>
                  <figure className="relative aspect-[4/5] overflow-hidden bg-primary-deep">
                    <Image src={img.src} alt={img.alt} fill
                      sizes="(min-width:640px) 46vw, 100vw" className="object-cover" />
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.faq.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-4xl leading-none">Preguntas frecuentes</h2>
            <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {service.faq.map((f) => (
                <details key={f.question} className="group">
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-sm leading-relaxed text-ink/70">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary-deep px-5 py-16 text-white md:py-24">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <p className="font-sans text-xs uppercase tracking-[0.28em] text-accent">Siguiente paso</p>
            <h2 className="mt-3 text-4xl leading-none md:text-6xl">Cotice sin compromiso</h2>
            <p className="mt-5 max-w-md text-white/70">
              Cuéntenos el espacio. Respondemos por WhatsApp con el alcance por escrito.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center bg-white px-7 text-sm tracking-wide text-ink"
              >
                Cotice sin compromiso
                <span className="sr-only"> por WhatsApp</span>
              </a>
              <Link
                href="/#cotizar"
                className="inline-flex min-h-12 items-center justify-center border border-white/35 px-7 text-sm tracking-wide"
              >
                Completar el formulario
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {others.length > 0 && (
        <section className="border-t border-ink/10 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-sans text-xs font-medium uppercase tracking-[0.22em] text-ink/60">También le puede interesar</h2>
            <div className="mt-6 grid gap-px bg-ink/10 sm:grid-cols-2">
              {others.map((s) => (
                <Link
                  key={s.id}
                  href={`/servicios/${s.slug}`}
                  className="flex items-center gap-4 bg-marble p-5 transition-colors hover:bg-white"
                >
                  {s.image_path && (
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden">
                      <Image src={`/${s.image_path}`} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-display text-2xl">{s.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-accent">Ver servicio</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
