import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { LineIcon } from '@/components/ui/line-icons';
import { whyUs } from '@/lib/content/service-lines';
import { COMPANY_NAME } from '@/lib/site';

const icons = ['shield', 'work', 'clock', 'chat', 'card', 'pin'] as const;

export function WhyUs() {
  return (
    <section id="por-que-elegirnos" className="scroll-mt-24 bg-primary py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div id="quienes-somos" className="scroll-mt-24">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/img/equipo.jpg" alt={`Equipo de ${COMPANY_NAME}`} fill sizes="(min-width:1024px) 36vw, 100vw" className="object-cover" />
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
              {COMPANY_NAME} cuida residencias, comercios y edificios.
              Quien diagnostica el espacio es parte del equipo que lo ejecuta.
            </p>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="font-sans text-xs uppercase tracking-[0.28em] text-accent">Criterio</p>
            <h2 className="mt-3 text-4xl leading-none md:text-6xl">Por qué elegirnos</h2>
          </Reveal>
          <ul className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">
            {whyUs.map((item, index) => (
              <Reveal key={item.title} delay={index * 40}>
                <li className="h-full bg-primary p-5">
                  <LineIcon name={icons[index] ?? 'shield'} className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 font-sans text-base font-medium tracking-normal">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{item.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
