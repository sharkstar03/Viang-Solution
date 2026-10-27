'use client';

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * El contenido se ve sin JavaScript. La clase de animación se añade solo
 * cuando el bloque entra en pantalla. Si el observer no dispara, no se oculta.
 */
export function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = `${shown ? 'reveal-shown' : ''} ${className}`.trim();
  return (
    <div ref={ref} className={cls} style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
