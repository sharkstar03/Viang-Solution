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

export function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-white transition-colors duration-300 ${solid ? 'bg-primary-deep' : 'bg-primary-deep/75 backdrop-blur-md'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" aria-label={`${COMPANY_NAME} — inicio`} className="inline-flex min-h-11 items-center">
          <Image
            src="/img/white-logo.png"
            alt={COMPANY_NAME}
            width={800}
            height={215}
            priority
            className="h-9 w-auto md:h-12"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm tracking-wide text-white/80 transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link href="/#cotizar" className="inline-flex min-h-11 items-center border border-accent/80 px-5 text-sm tracking-wide text-accent transition-colors hover:bg-accent hover:text-on-accent">
            Cotice sin compromiso
          </Link>
        </nav>
        <button
          className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="menu-panel fixed inset-0 z-50 flex flex-col bg-primary-deep px-6 pb-10 pt-4 md:hidden" aria-label="Menú móvil">
          <div className="flex items-center justify-between">
            <Image src="/img/white-logo.png" alt="" width={800} height={215} className="h-9 w-auto" />
            <button className="inline-flex h-11 w-11 items-center justify-center" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="mt-16 flex flex-1 flex-col">
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-16 items-baseline gap-4 border-b border-white/10 font-display text-4xl text-white"
              >
                <span className="font-sans text-xs tracking-[0.2em] text-accent">0{index + 1}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/#cotizar" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center justify-center border border-accent text-sm tracking-wide text-accent">
            Cotice sin compromiso
          </Link>
        </nav>
      )}
    </header>
  );
}
