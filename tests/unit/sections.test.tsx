// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Stats } from '@/components/sections/Stats';
import { Portfolio } from '@/components/sections/Portfolio';
import { Testimonials } from '@/components/sections/Testimonials';
import { Services } from '@/components/sections/Services';
import { Hero } from '@/components/sections/Hero';
import type { Service } from '@/lib/types';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {} unobserve() {} disconnect() {}
  });
  vi.stubGlobal('matchMedia', vi.fn((q: string) => ({
    matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
});

const svc = (n: number): Service => ({
  id: String(n), slug: `servicio-${n}`, title: `Servicio ${n}`,
  short_description: 'desc', long_description: '', icon: 'sparkles',
  image_path: 'img/Servicios/PISOS.jpg', faq: [], price_from: null, sort_order: n,
});

describe('secciones condicionales: vacías → null', () => {
  it('Stats vacío no renderiza nada', () => {
    const { container } = render(<Stats stats={[]} />);
    expect(container.innerHTML).toBe('');
  });
  it('Portfolio vacío no renderiza nada', () => {
    const { container } = render(<Portfolio projects={[]} />);
    expect(container.innerHTML).toBe('');
  });
  it('Testimonials vacío no renderiza nada', () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('Services', () => {
  it('renderiza 6 tarjetas enlazadas a su página', () => {
    render(<Services services={[1, 2, 3, 4, 5, 6].map(svc)} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(6);
    expect(links[0]!.getAttribute('href')).toBe('/servicios/servicio-1');
  });
});

describe('Hero', () => {
  it('tiene CTA de WhatsApp y de cotizar', () => {
    render(<Hero whatsapp="+50767340816" />);
    const wa = screen.getByRole('link', { name: /whatsapp/i });
    expect(wa.getAttribute('href')).toContain('wa.me/50767340816');
    expect(screen.getByRole('link', { name: /cotiza/i }).getAttribute('href')).toBe('/#cotizar');
  });
});
