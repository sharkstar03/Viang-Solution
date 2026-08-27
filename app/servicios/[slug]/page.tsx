import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { QuoteForm } from '@/components/forms/QuoteForm';
import { getServiceBySlug, getServices, getSettings } from '@/lib/content/queries';
import { serviceJsonLd, faqJsonLd } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';
import { QuoteFormPreset as QuoteFormWithPreset } from '@/components/forms/QuoteFormPreset';

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
  ],
  'limpieza-especializada': [
    { src: '/img/stock/deep-clean.jpg', alt: 'Limpieza profunda de alfombra con equipo de vapor y protección' },
    { src: '/img/stock/pro-vacuum.jpg', alt: 'Aspirado profesional de una sala moderna' },
  ],
};

/** Renderiza la descripción larga: líneas "- x" como viñetas, el resto párrafos. */
function LongDescription({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  const items = lines.filter((l) => l.startsWith('- '));
  const paras = lines.filter((l) => !l.startsWith('- '));
  return (
    <div>
      {paras.map((p) => (
        <p key={p} className="leading-relaxed text-ink/70">{p}</p>
      ))}
      {items.length > 0 && (
        <ul className="mt-5 space-y-3">
          {items.map((l) => (
            <li key={l} className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-whatsapp" fill="currentColor" aria-hidden>
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
              </svg>
              <span className="text-ink/80">{l.slice(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, settings, services] = await Promise.all([
    getServiceBySlug(slug), getSettings(), getServices(),
  ]);
  if (!service) notFound();

  const ldService = serviceJsonLd(service, settings);
  const ldFaq = faqJsonLd(service.faq);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldService) }} />
      {ldFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />
      )}

      <section className="relative flex min-h-[45svh] items-end bg-primary">
        {service.image_path && (
          <Image src={`/${service.image_path}`} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/20" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-32">
          <h1 className="max-w-2xl text-3xl font-bold text-white md:text-5xl">{service.title}</h1>
          <p className="mt-3 max-w-xl text-white/85">{service.short_description}</p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1fr_380px]">
          <Reveal>
            <LongDescription text={service.long_description} />

            {(SERVICE_AMBIENCE[service.slug] ?? []).length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-4">
                {SERVICE_AMBIENCE[service.slug]!.map((img) => (
                  <div key={img.src} className="relative h-52 overflow-hidden rounded-card md:h-64">
                    <Image src={img.src} alt={img.alt} fill quality={60}
                      sizes="(min-width:1024px) 33vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {service.faq.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
                <div className="mt-5 space-y-3">
                  {service.faq.map((f) => (
                    <details key={f.question} className="group rounded-lg border border-ink/10 bg-white">
                      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-5 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                        {f.question}
                        <span aria-hidden className="text-primary-light transition-transform group-open:rotate-45">＋</span>
                      </summary>
                      <p className="px-5 pb-4 text-ink/70">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 rounded-card bg-primary p-7 text-white">
              <h2 className="text-xl font-bold">¿Listo para empezar?</h2>
              <p className="mt-2 text-white/80">Respuesta rápida y cotización sin compromiso.</p>
              <div className="mt-5">
                <Button variant="whatsapp" asChild>
                  <a
                    href={waLink(settings.whatsapp, `Hola, me interesa ${service.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Escríbenos por WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="lg:sticky lg:top-24">
              <QuoteFormWithPreset services={services} preset={service.title} settings={{ hours: settings.business_hours, whatsapp: settings.whatsapp }} />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
