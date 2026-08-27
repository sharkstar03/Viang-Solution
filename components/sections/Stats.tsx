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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-light py-16 text-white md:py-20">
      {/* brillo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            Resultados que nos respaldan
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 120}>
              <div className="flex h-full flex-col items-center rounded-card border border-white/15 bg-white/10 px-6 py-8 text-center backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <ServiceIcon name={s.icon} className="h-6 w-6" />
                </span>
                <p className="mt-4 text-5xl font-bold tracking-tight text-white md:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-white/70">
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
