import { Reveal } from '@/components/ui/Reveal';
import { LineIcon } from '@/components/ui/line-icons';
import { processSteps } from '@/lib/content/service-lines';

const icons = ['visit', 'quote', 'calendar', 'work', 'shield'] as const;

export function Process() {
  return (
    <section id="como-trabajamos" className="scroll-mt-24 bg-marble py-20 text-ink md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-sans text-xs uppercase tracking-[0.28em] text-accent">Método</p>
          <h2 className="mt-3 text-4xl leading-none md:text-6xl">Cómo trabajamos</h2>
        </Reveal>
        <ol className="mt-12 grid gap-px bg-ink/10 md:grid-cols-5">
          {processSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 60}>
              <li className="flex h-full flex-col bg-marble p-6">
                <LineIcon name={icons[index] ?? 'work'} className="h-6 w-6 text-accent" />
                <span className="mt-8 font-display text-4xl text-ink/25">0{index + 1}</span>
                <h3 className="mt-3 font-sans text-base font-medium tracking-normal text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
