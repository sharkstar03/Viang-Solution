'use client';

import { useEffect, useState } from 'react';

/**
 * Video de fondo SOLO escritorio: el elemento ni se monta en móvil,
 * así el archivo jamás se descarga en un teléfono.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = matchMedia('(min-width: 768px)');
    const update = () => setDesktop(mq.matches && !matchMedia('(prefers-reduced-motion: reduce)').matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!desktop) return null;
  return (
    <video
      className="absolute inset-0 hidden h-full w-full object-cover md:block"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
