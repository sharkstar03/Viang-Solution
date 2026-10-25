import { Reveal } from '@/components/ui/Reveal';
import { processSteps } from '@/lib/content/service-lines';

export function Process() {
  return (
    <section id="como-trabajamos" className="scroll-mt-24 bg-accent py-16 text-on-accent md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">Cómo trabajamos</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-on-accent/85">
            Cinco pasos, del primer vistazo a la entrega. Siempre con el alcance por escrito.
          </p>
        </Reveal>
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {processSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <li className="flex h-full flex-col rounded-2xl bg-white p-5 text-ink shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
