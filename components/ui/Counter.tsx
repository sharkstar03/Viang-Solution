'use client';

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Contador que sube al entrar en viewport; con reduced-motion muestra el final. */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [reduced] = useState(prefersReducedMotion);
  const [value, setValue] = useState(reduced ? to : 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const duration = 1200;
      const tick = (t: number) => {
        const p = Math.min((t - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3)))); // ease-out cúbico
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, reduced]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
