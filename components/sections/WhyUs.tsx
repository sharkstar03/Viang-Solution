import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import { whyUs } from '@/lib/content/service-lines';
import { COMPANY_NAME } from '@/lib/site';

export function WhyUs() {
  return (
    <section id="por-que-elegirnos" className="scroll-mt-24 bg-primary py-16 text-white md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <div id="quienes-somos" className="scroll-mt-24">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft">
              <Image
                src="/img/equipo.jpg"
                alt={`Equipo de ${COMPANY_NAME}`}
                fill
                sizes="(min-width:1024px) 36vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              {COMPANY_NAME} cuida residencias, comercios y edificios en Panamá.
              Quien diagnostica el espacio es parte del equipo que lo ejecuta.
            </p>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <h2 className="text-3xl font-bold md:text-4xl">Por qué elegirnos</h2>
          </Reveal>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {whyUs.map((item, index) => (
              <Reveal key={item.title} delay={index * 50}>
                <li className="h-full rounded-2xl bg-white p-5 text-ink shadow-soft">
                  <span className="mb-3 block h-1.5 w-10 rounded-full bg-accent" aria-hidden />
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">{item.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
