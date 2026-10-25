import { Reveal } from '@/components/ui/Reveal';
import { QuoteForm } from '@/components/forms/QuoteForm';
import type { BusinessHours, Service } from '@/lib/types';

export function ContactCta({ services, hours, whatsapp }: { services: Service[]; hours: BusinessHours; whatsapp: string }) {
  return (
    <section id="cotizar" className="scroll-mt-20 bg-primary py-16 text-white md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">Cotiza sin compromiso</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/75">
            Cuéntenos qué necesita y le respondemos con una cotización a medida.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <QuoteForm services={services} hours={hours} whatsapp={whatsapp} />
        </Reveal>
      </div>
    </section>
  );
}
