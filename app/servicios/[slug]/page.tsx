import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceIcon, WhatsAppIcon } from '@/components/ui/icons';
import { getServiceBySlug, getServices, getSettings } from '@/lib/content/queries';
import { serviceJsonLd, faqJsonLd } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.short_description,
    alternates: { canonical: `/servicios/${service.slug}` },
  };
}

/**
 * Imágenes de ambiente por servicio (stock con licencia libre — Pexels).
 * Ilustran el TIPO de resultado; el alt nunca las presenta como trabajo
 * propio. La Fase 2 las reemplaza por la galería real (tabla projects).
 */
const SERVICE_AMBIENCE: Record<string, { src: string; alt: string }[]> = {
  'tratamientos-e-instalacion-de-pisos': [
    { src: '/img/stock/marble-lobby.jpg', alt: 'Lobby con piso de mármol pulido y brillante' },
    { src: '/img/Servicios/pisos-oficina.jpg', alt: 'Piso de travertino pulido con acabado espejo en una oficina' },
  ],
  'limpieza-especializada': [
    { src: '/img/stock/deep-clean.jpg', alt: 'Limpieza profunda de alfombra con equipo de vapor y protección' },
    { src: '/img/stock/pro-vacuum.jpg', alt: 'Aspirado profesional de una sala moderna' },
  ],
  'instalaciones-y-reparaciones': [
    { src: '/img/Servicios/instalacionesac.jpg', alt: 'Técnico dando servicio a un aire acondicionado' },
    { src: '/img/Servicios/pintura.jpg', alt: 'Trabajo de pintura con acabado prolijo' },
  ],
};

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

  const { intro, items } = splitDescription(service.long_description);
  const others = services.filter((s) => s.slug !== service.slug);
  const gallery = SERVICE_AMBIENCE[service.slug] ?? [];
  const ldService = serviceJsonLd(service, settings);
  const ldFaq = faqJsonLd(service.faq);
  const waHref = waLink(settings.whatsapp, `Hola, me interesa ${service.title}`);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldService) }} />
      {ldFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />
      )}

      {/* ── Portada ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[52svh] items-end bg-primary">
        {service.image_path && (
          <Image src={`/${service.image_path}`} alt="" fill priority quality={60} sizes="100vw" className="object-cover" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/20" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 pt-36">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
            <ServiceIcon name={service.icon} className="h-4 w-4" />
            Servicio especializado
          </p>
          <h1 className="max-w-2xl text-3xl font-bold text-white md:text-5xl">{service.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">{service.short_description}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button variant="whatsapp" size="lg" asChild>
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-5 w-5" />
                Cotizar por WhatsApp
              </a>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/#cotizar">Cotizar en línea</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Qué incluye ─────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            {intro.map((p) => (
              <p key={p} className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-ink/70">
                {p}
              </p>
            ))}
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal key={item} delay={i * 60}>
                <div className="flex h-full items-start gap-3 rounded-card border border-ink/5 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                    </svg>
                  </span>
                  <p className="text-ink/80">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería de ambiente ─────────────────────────────── */}
      {gallery.length > 0 && (
        <section className="bg-surface py-14 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <h2 className="text-center text-2xl font-bold md:text-3xl">El nivel que buscamos en cada trabajo</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {gallery.map((img, i) => (
                <Reveal key={img.src} delay={i * 80}>
                  <div className="relative h-60 overflow-hidden rounded-card shadow-soft md:h-72">
                    <Image src={img.src} alt={img.alt} fill quality={60}
                      sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────── */}
      {service.faq.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-2xl font-bold md:text-3xl">Preguntas frecuentes</h2>
            <div className="mt-7 space-y-3">
              {service.faq.map((f) => (
                <details key={f.question} className="group rounded-card border border-ink/10 bg-white">
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-5 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden className="text-primary-light transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <p className="px-5 pb-4 text-ink/70">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA final ───────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-14 md:pb-20">
        <Reveal>
          <div className="rounded-card bg-gradient-to-r from-primary to-primary-light p-8 text-center text-white md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">¿Hablamos de su proyecto?</h2>
            <p className="mx-auto mt-2 max-w-md text-white/80">
              Cuéntenos qué necesita y reciba una cotización a medida, sin compromiso.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="whatsapp" size="lg" asChild>
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-5 w-5" />
                  Escríbenos por WhatsApp
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/#cotizar">Cotizar en línea</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Otros servicios ─────────────────────────────────── */}
      {others.length > 0 && (
        <section className="border-t border-ink/5 bg-surface py-14">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-xl font-bold text-ink/70">También le puede interesar</h2>
            <div className="mt-7 flex flex-wrap justify-center gap-5">
              {others.map((s) => (
                <Link
                  key={s.id}
                  href={`/servicios/${s.slug}`}
                  className="group flex w-full items-center gap-4 rounded-card bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-[calc(50%-0.625rem)]"
                >
                  {s.image_path && (
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={`/${s.image_path}`} alt="" fill quality={55} sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold group-hover:text-primary-light">{s.title}</p>
                    <span className="text-sm font-semibold text-primary-light">Ver más →</span>
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
