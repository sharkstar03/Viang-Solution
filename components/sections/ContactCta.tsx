import { Reveal } from '@/components/ui/Reveal';
import { QuoteForm } from '@/components/forms/QuoteForm';
import { Button } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { waLink } from '@/lib/whatsapp';
import type { BusinessHours, Service } from '@/lib/types';

export function ContactCta({ services, hours, whatsapp }: { services: Service[]; hours: BusinessHours; whatsapp: string }) {
  return (
    <>
      <section className="bg-accent py-16 text-on-accent md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold md:text-5xl">¿Listo para recuperar sus espacios?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-on-accent/85">
              Cuéntenos qué piso, fachada o instalación necesita. Le respondemos por WhatsApp
              con una cotización escrita.
            </p>
            <div className="mt-8">
              <Button variant="secondary" size="lg" asChild>
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
            </div>
          </Reveal>
        </div>
      </section>
      <section id="cotizar" className="scroll-mt-24 bg-primary py-16 text-white md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <h2 className="text-center text-3xl font-bold md:text-4xl">Solicite su cotización</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-white/90">
              Elija el servicio y arme el mensaje. En el sitio público se envía por WhatsApp.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-10">
            <QuoteForm services={services} hours={hours} whatsapp={whatsapp} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
