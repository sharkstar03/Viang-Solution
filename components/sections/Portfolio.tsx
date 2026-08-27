import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import type { Project } from '@/lib/types';

/** Antes/después. Se oculta sola hasta que haya trabajos reales cargados. */
export function Portfolio({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold md:text-4xl">Trabajos reales</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <article className="overflow-hidden rounded-card bg-white shadow-soft">
                <div className="grid grid-cols-2">
                  <figure className="relative h-56">
                    <Image src={`/${p.image_before}`} alt={`${p.title} — antes`} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" />
                    <figcaption className="absolute bottom-2 left-2 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white">Antes</figcaption>
                  </figure>
                  <figure className="relative h-56">
                    <Image src={`/${p.image_after}`} alt={`${p.title} — después`} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" />
                    <figcaption className="absolute bottom-2 right-2 rounded-full bg-whatsapp px-3 py-1 text-xs font-semibold text-white">Después</figcaption>
                  </figure>
                </div>
                <div className="p-5">
                  <h3 className="font-bold">{p.title}</h3>
                  {p.description && <p className="mt-1 text-sm text-ink/60">{p.description}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
