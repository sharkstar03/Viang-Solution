// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Counter } from '@/components/ui/Counter';

function mockMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal('matchMedia', vi.fn((q: string) => ({
    matches: q.includes('prefers-reduced-motion') ? reducedMotion : false,
    media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe('Button', () => {
  it('renderiza como <a> con asChild', () => {
    render(<Button asChild><a href="/x">Ir</a></Button>);
    expect(screen.getByRole('link', { name: 'Ir' })).toBeTruthy();
  });

  it('renderiza como <button> por defecto', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });
});

describe('Reveal', () => {
  it('con reduced-motion renderiza visible, sin clase de animación', () => {
    mockMatchMedia(true);
    const { container } = render(<Reveal><p>Hola</p></Reveal>);
    expect(container.firstElementChild!.className).not.toContain('reveal-shown');
    expect(container.textContent).toContain('Hola');
  });

  it('sin observer disparado el contenido sigue visible', () => {
    mockMatchMedia(false);
    const { container } = render(<Reveal><p>Hola</p></Reveal>);
    const el = container.firstElementChild!;
    expect(el.className).not.toContain('reveal-hidden');
    expect(el.className).not.toContain('reveal-shown');
    expect(el.textContent).toContain('Hola');
  });
});

describe('Counter', () => {
  it('con reduced-motion muestra el valor final directo', () => {
    mockMatchMedia(true);
    render(<Counter to={20} suffix="+" />);
    expect(screen.getByText('20+')).toBeTruthy();
  });

  it('sin una cifra real no renderiza nada', () => {
    mockMatchMedia(false);
    const { container } = render(<Counter to={0} suffix="+" />);
    expect(container.textContent).toBe('');
  });
});
