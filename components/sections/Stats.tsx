import { Counter } from '@/components/ui/Counter';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceIcon } from '@/components/ui/icons';
import type { Stat } from '@/lib/types';

/**
 * Cifras del negocio. Se oculta sola mientras no haya filas publicadas.
 * Al entrar en pantalla las tarjetas aparecen escalonadas y los números
 * cuentan desde cero (con prefers-reduced-motion, valor final directo).
 */
export function Stats({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className="border-y border-ink/5 bg-surface py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-ink md:text-3xl">
            Resultados que nos respaldan
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 120}>
              <div className="flex h-full flex-col items-center rounded-card bg-white px-6 py-7 text-center shadow-soft transition-transform duration-300 hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <ServiceIcon name={s.icon} className="h-5 w-5" />
                </span>
                <p className="mt-3 text-4xl font-bold tracking-tight text-primary md:text-5xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-ink/50">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
