'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { COMPANY_NAME } from '@/lib/site';

const nav = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#trabajos', label: 'Trabajos' },
  { href: '/#como-trabajamos', label: 'Proceso' },
  { href: '/#cotizar', label: 'Cotizar' },
];

/** logo.png is 963×259. Rendered height is set in CSS; width stays auto. */
const LOGO = { src: '/img/logo.png', width: 963, height: 259 } as const;

function Logo({ className }: { className: string }) {
  return (
    <Image
      src={LOGO.src}
      alt={COMPANY_NAME}
      width={LOGO.width}
      height={LOGO.height}
      priority
      className={className}
    />
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-ink/10 text-ink transition-shadow duration-300 ${
        solid ? 'bg-white shadow-soft' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" aria-label={`${COMPANY_NAME} — inicio`} className="inline-flex min-h-11 items-center">
          <Logo className="h-10 w-auto md:h-[52px]" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="font-medium text-ink transition-colors hover:text-primary">
              {n.label}
            </Link>
          ))}
          <Link
            href="/#cotizar"
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-on-accent transition-all hover:brightness-105 active:scale-[0.98]"
          >
            Contáctanos
          </Link>
        </nav>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          className="menu-panel fixed inset-0 z-50 flex flex-col bg-white px-6 pb-8 pt-4 text-ink md:hidden"
          aria-label="Menú móvil"
        >
          <div className="flex items-center justify-between">
            <Logo className="h-10 w-auto" />
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="mt-10 flex flex-1 flex-col gap-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center rounded-2xl px-2 font-display text-3xl font-semibold text-ink active:bg-primary/5"
              >
                {n.label}
              </Link>
            ))}
          </div>
          <Link
            href="/#cotizar"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-on-accent"
          >
            Contáctanos
          </Link>
        </nav>
      )}
    </header>
  );
}
