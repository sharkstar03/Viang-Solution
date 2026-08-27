'use client';

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Aparición suave al entrar en pantalla. Una sola vez, 300 ms, CSS puro.
 * Con prefers-reduced-motion el contenido se muestra directo, sin animar.
 */
export function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [reduced] = useState(prefersReducedMotion);
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const cls = reduced ? className : `${shown ? 'reveal-shown' : 'reveal-hidden'} ${className}`;
  return (
    <div ref={ref} className={cls.trim()} style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
