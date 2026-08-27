import { Reveal } from '@/components/ui/Reveal';
import type { Testimonial } from '@/lib/types';

/** Se oculta sola hasta que haya testimonios reales. Jamás inventados. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">Lo que dicen nuestros clientes</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-card bg-white p-6 shadow-soft">
                <div aria-label={`${t.rating} de 5 estrellas`} className="text-accent">
                  {'★'.repeat(t.rating)}
                  <span className="text-ink/15">{'★'.repeat(5 - t.rating)}</span>
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  {t.author_name}
                  {t.company && <span className="block font-normal text-ink/50">{t.company}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
