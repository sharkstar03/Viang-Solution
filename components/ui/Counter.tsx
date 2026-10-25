'use client';

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function inView(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

/**
 * Cuenta al entrar en pantalla. El observer anidado en un padre con
 * `transform` (Reveal) a veces no dispara; el scroll y un chequeo de
 * layout cubren ese caso para que el número no se quede en 0.
 * Sin una cifra real (> 0) no renderiza nada.
 */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const valid = Number.isFinite(to) && to > 0;
  const reducedAtStart = prefersReducedMotion();
  const [value, setValue] = useState(reducedAtStart && valid ? to : 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!valid) return;
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const duration = 1200;
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (inView(el)) start();

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            io?.disconnect();
            start();
          }
        }, { threshold: 0 })
      : null;
    io?.observe(el);

    const onScroll = () => {
      if (!inView(el)) return;
      window.removeEventListener('scroll', onScroll);
      start();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const late = window.setTimeout(() => {
      if (inView(el)) start();
    }, 350);

    return () => {
      io?.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(late);
    };
  }, [to, valid]);

  if (!valid) return null;

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
