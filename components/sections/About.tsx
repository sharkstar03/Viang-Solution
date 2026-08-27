import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';

export function About() {
  return (
    <section id="quienes-somos" className="bg-surface py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <Reveal>
          <div className="relative h-72 overflow-hidden rounded-card shadow-soft md:h-96">
            <Image
              src="/img/equipo.jpg"
              alt="El equipo de Viang Solution"
              fill
              quality={60}
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="text-3xl font-bold md:text-4xl">Quiénes somos</h2>
          <p className="mt-5 leading-relaxed text-ink/70">
            Viang Solutions and Service se consolida como su socio estratégico en el
            mantenimiento, instalación y embellecimiento de espacios residenciales y
            comerciales. Amplia trayectoria en tratamientos especializados para superficies
            y servicios integrales de limpieza y reparación, con resultados de excelencia
            y durabilidad.
          </p>
          <p className="mt-4 leading-relaxed text-ink/70">
            Combinamos técnicas de vanguardia, materiales de primera calidad y un equipo
            de profesionales altamente capacitados, comprometidos con la preservación y
            mejora del valor de sus inmuebles.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
