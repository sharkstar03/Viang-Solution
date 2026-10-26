'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { workGallery } from '@/lib/content/service-lines';

export function WorkGallery() {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
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

  return (
    <section id="trabajos" className="scroll-mt-24 bg-primary-deep py-20 text-white md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-sans text-xs uppercase tracking-[0.28em] text-accent">Resultados reales</p>
        <h2 className="mt-3 max-w-xl text-4xl leading-none md:text-6xl">Trabajos reales</h2>
        <p className="mt-5 max-w-xl text-white/70">
          Obras en residencias, terrazas, oficinas y galeras. En el teléfono, deslice para recorrerlas.
        </p>

        <div className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-12 md:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {workGallery.map((item, index) => {
            const wide = index % 5 === 0;
            return (
              <button
                key={item.src}
                type="button"
                onClick={() => setActive(index)}
                className={`group relative aspect-[3/4] w-[78%] shrink-0 snap-center overflow-hidden border-0 bg-primary p-0 md:aspect-auto md:w-auto ${wide ? 'md:col-span-7 md:min-h-[26rem]' : 'md:col-span-5 md:min-h-72'}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={wide ? '(min-width:768px) 58vw, 78vw' : '(min-width:768px) 40vw, 78vw'}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
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
        onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        {photo && (
          <div
            className="bg-primary-deep text-white"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => { touchX.current = event.changedTouches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              const start = touchX.current;
              touchX.current = null;
              if (start == null) return;
              const dx = (event.changedTouches[0]?.clientX ?? start) - start;
              if (dx > 48) step(-1);
              else if (dx < -48) step(1);
            }}
          >
            <div className="relative h-[74vh] w-[min(92vw,64rem)]">
              <Image src={photo.src} alt={photo.alt} fill sizes="92vw" className="object-contain" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="max-w-md text-sm">{photo.alt}</p>
              <div className="flex gap-2">
                <button type="button" className="min-h-11 border border-white/25 px-4 text-sm" onClick={() => step(-1)}>Anterior</button>
                <button type="button" className="min-h-11 border border-white/25 px-4 text-sm" onClick={() => step(1)}>Siguiente</button>
                <button type="button" className="min-h-11 bg-white px-4 text-sm text-ink" onClick={() => dialogRef.current?.close()}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
