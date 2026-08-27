// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { waLink } from '@/lib/whatsapp';
import { MobileActionBar } from '@/components/layout/MobileActionBar';
import { OpenNowBadge } from '@/components/layout/OpenNowBadge';
import type { BusinessHours } from '@/lib/types';

describe('waLink', () => {
  it('deja solo dígitos y codifica el mensaje', () => {
    expect(waLink('+507 6734-0816', 'Hola, quiero cotizar')).toBe(
      'https://wa.me/50767340816?text=Hola%2C%20quiero%20cotizar',
    );
  });
});

describe('MobileActionBar', () => {
  it('tiene WhatsApp, Llamar y Cotizar con áreas táctiles accesibles', () => {
    render(<MobileActionBar phone="+50767340816" whatsapp="+50767340816" />);
    const wa = screen.getByRole('link', { name: /whatsapp/i });
    const tel = screen.getByRole('link', { name: /llamar/i });
    const quote = screen.getByRole('link', { name: /cotizar/i });
    expect(wa.getAttribute('href')).toContain('wa.me/50767340816');
    expect(tel.getAttribute('href')).toBe('tel:+50767340816');
    expect(quote.getAttribute('href')).toBe('/#cotizar');
    for (const el of [wa, tel, quote]) expect(el.className).toContain('min-h-11');
  });
});

const hours: BusinessHours = {
  mon: { open: '08:00', close: '17:00' }, tue: { open: '08:00', close: '17:00' },
  wed: { open: '08:00', close: '17:00' }, thu: { open: '08:00', close: '17:00' },
  fri: { open: '08:00', close: '17:00' }, sat: null, sun: null,
};

describe('OpenNowBadge', () => {
  it('abierto → mensaje de respuesta en minutos', () => {
    render(<OpenNowBadge hours={hours} now={new Date('2026-08-25T15:00:00Z')} />);
    expect(screen.getByText(/abierto ahora/i)).toBeTruthy();
  });

  it('cerrado → indica cuándo respondemos', () => {
    render(<OpenNowBadge hours={hours} now={new Date('2026-08-25T23:30:00Z')} />);
    expect(screen.getByText(/te respondemos/i)).toBeTruthy();
  });
});
