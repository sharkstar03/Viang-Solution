'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { workGallery } from '@/lib/content/service-lines';

/**
 * Galería de trabajos reales. La cuadrícula mezcla tamaños; el diálogo
 * nativo abre la foto completa y se cierra con Escape o con el fondo.
 */
export function WorkGallery() {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const photo = active === null ? null : workGallery[active];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active === null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [active]);

  const step = useCallback((delta: number) => {
    setActive((current) => {
      if (current === null) return current;
      return (current + delta + workGallery.length) % workGallery.length;
    });
  }, []);

  const touchX = useRef<number | null>(null);

  return (
    <section id="trabajos" className="scroll-mt-24 bg-primary-deep py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center">
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-bold text-on-accent">Resultados reales</span>
        </p>
        <h2 className="mt-2 text-center text-3xl font-bold md:text-4xl">Trabajos reales</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-white/90">
          Mármol, madera, piscinas, galpones y filtración de agua. Fotos de obras en Panamá.
          Las marcadas «Antes» muestran el punto de partida. En el teléfono, deslice la fila.
        </p>
        <div className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {workGallery.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(index)}
              className="relative aspect-[3/4] w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl border-0 bg-primary p-0 text-left"
            >
              <Image src={item.src} alt={item.alt} fill sizes="78vw" className="object-cover" />
              {item.badge && (
                <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-on-accent">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-10 hidden gap-3 md:grid md:grid-cols-4 md:auto-rows-[9.5rem]">
          {workGallery.map((item, index) => {
            const lead = index % 7 === 0;
            return (
              <button
                key={item.src}
                type="button"
                onClick={() => setActive(index)}
                className={`group relative overflow-hidden rounded-2xl border-0 bg-primary p-0 text-left shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${lead ? 'col-span-2 row-span-2 min-h-64 md:min-h-0' : 'min-h-40'}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={lead ? '(min-width:768px) 50vw, 100vw' : '(min-width:768px) 25vw, 50vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.badge && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-on-accent">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={photo?.alt ?? 'Foto del trabajo'}
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        {photo && (
          <div
            className="overflow-hidden rounded-2xl bg-primary-deep text-white shadow-soft"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchX.current;
              touchX.current = null;
              if (start == null) return;
              const dx = (event.changedTouches[0]?.clientX ?? start) - start;
              if (dx > 48) step(-1);
              else if (dx < -48) step(1);
            }}
          >
            <div className="relative h-[72vh] w-[min(92vw,56rem)]">
              <Image src={photo.src} alt={photo.alt} fill sizes="92vw" className="object-contain" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm font-medium">{photo.alt}</p>
              <div className="flex gap-2">
                <button type="button" className="min-h-11 rounded-full bg-white/15 px-4 font-semibold" onClick={() => step(-1)}>
                  Anterior
                </button>
                <button type="button" className="min-h-11 rounded-full bg-white/15 px-4 font-semibold" onClick={() => step(1)}>
                  Siguiente
                </button>
                <button type="button" className="min-h-11 rounded-full bg-accent px-4 font-semibold text-on-accent" onClick={() => dialogRef.current?.close()}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
