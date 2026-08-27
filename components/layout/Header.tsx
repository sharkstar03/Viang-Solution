'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const nav = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#quienes-somos', label: 'Quiénes somos' },
  { href: '/#cotizar', label: 'Cotizar' },
];

export function Header({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label="Viang Solution — inicio">
          <Image src="/img/white-logo.png" alt="Viang Solution" width={140} height={44} priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="font-medium text-white/90 transition-colors hover:text-white">
              {n.label}
            </Link>
          ))}
          <a
            href={`tel:${phone}`}
            className="rounded-full bg-white/15 px-5 py-2.5 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            {phone.replace('+507', '(507) ')}
          </a>
        </nav>

        <button
          className="rounded-lg p-2 text-white md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="mx-4 rounded-2xl bg-white p-4 shadow-soft md:hidden" aria-label="Menú móvil">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 font-medium text-ink hover:bg-surface"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
