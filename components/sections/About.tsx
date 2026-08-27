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
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="text-3xl font-bold md:text-4xl">Quiénes somos</h2>
          <p className="mt-5 leading-relaxed text-ink/70">
            Con más de 20 años de experiencia, somos líderes en servicios de limpieza y
            mantenimiento en la región. Nuestro compromiso con la excelencia y la
            satisfacción del cliente nos ha permitido crecer y diversificar nuestros servicios.
          </p>
          <p className="mt-4 leading-relaxed text-ink/70">
            Contamos con un equipo altamente capacitado y utilizamos productos eco-amigables
            de primera calidad. Nos especializamos en soluciones integrales para hogares y
            empresas, garantizando resultados excepcionales en cada proyecto.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
