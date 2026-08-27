// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { waLink } from '@/lib/whatsapp';
import { OpenNowBadge } from '@/components/layout/OpenNowBadge';
import type { BusinessHours } from '@/lib/types';

describe('waLink', () => {
  it('deja solo dígitos y codifica el mensaje', () => {
    expect(waLink('+507 6734-0816', 'Hola, quiero cotizar')).toBe(
      'https://wa.me/50767340816?text=Hola%2C%20quiero%20cotizar',
    );
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
