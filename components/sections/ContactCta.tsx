import { Reveal } from '@/components/ui/Reveal';
import { QuoteForm } from '@/components/forms/QuoteForm';
import { waLink } from '@/lib/whatsapp';
import type { BusinessHours, Service } from '@/lib/types';

export function ContactCta({ services, hours, whatsapp }: { services: Service[]; hours: BusinessHours; whatsapp: string }) {
  return (
    <section id="cotizar" className="scroll-mt-24 bg-marble py-20 text-ink md:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="font-sans text-xs uppercase tracking-[0.28em] text-accent">Cotización</p>
          <h2 className="mt-3 text-4xl leading-none md:text-6xl">Cotice sin compromiso</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/75">
            Cuéntenos el piso, la fachada o la instalación. Respondemos por WhatsApp
            con el alcance por escrito. Atención en todo Panamá.
          </p>
          <a
            href={waLink(whatsapp, 'Hola, quiero cotizar un servicio')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center bg-primary px-7 text-sm tracking-wide text-white"
          >
            Cotice sin compromiso
            <span className="sr-only"> por WhatsApp</span>
          </a>
          <p className="mt-6 text-sm text-ink/60">Aceptamos Visa y Mastercard.</p>
        </Reveal>
        <Reveal delay={80}>
          <QuoteForm services={services} hours={hours} whatsapp={whatsapp} />
        </Reveal>
      </div>
    </section>
  );
}
