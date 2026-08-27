import { Counter } from '@/components/ui/Counter';
import { Reveal } from '@/components/ui/Reveal';
import type { Stat } from '@/lib/types';

/** Se oculta sola mientras no haya cifras cargadas desde el panel. */
export function Stats({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className="bg-primary py-14 text-white">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 80}>
            <p className="text-4xl font-bold text-accent">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm text-white/80">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
