// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import type { BusinessHours, Service } from '@/lib/types';

// El widget real carga el script de Cloudflare; en tests entrega un token fijo.
vi.mock('@/components/forms/TurnstileWidget', () => ({
  TurnstileWidget: ({ onToken }: { onToken: (t: string) => void }) => {
    React.useEffect(() => onToken('tok_test'), [onToken]);
    return <div data-testid="turnstile" />;
  },
}));

import { QuoteForm } from '@/components/forms/QuoteForm';

const services: Service[] = [1, 2, 3].map((n) => ({
  id: String(n), slug: `s${n}`, title: `Servicio ${n}`, short_description: '',
  long_description: '', icon: '', image_path: null, faq: [], price_from: null, sort_order: n,
}));
const hours: BusinessHours = { mon: { open: '08:00', close: '17:00' } };

function fillStep2AndGo() {
  fireEvent.click(screen.getByRole('button', { name: /servicio 2/i }));
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
  fireEvent.change(screen.getByLabelText(/mensaje/i), {
    target: { value: 'Necesito pulir el piso de mármol de mi sala.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
}

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('QuoteForm', () => {
  it('paso 1 lista los servicios y no avanza sin selección', () => {
    render(<QuoteForm services={services} hours={hours} />);
    expect(screen.getByRole('button', { name: /servicio 1/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.queryByLabelText(/mensaje/i)).toBeNull(); // sigue en paso 1
  });

  it('lo escrito persiste en sessionStorage (sobrevive recargas)', () => {
    render(<QuoteForm services={services} hours={hours} />);
    fireEvent.click(screen.getByRole('button', { name: /servicio 1/i }));
    const saved = JSON.parse(sessionStorage.getItem('viang-quote-draft') ?? '{}');
    expect(saved.service).toBe('Servicio 1');
  });

  it('éxito → confirmación y borrador limpio', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }))));
    render(<QuoteForm services={services} hours={hours} />);
    fillStep2AndGo();
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'María Pérez' } });
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'm@e.com' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '60000000' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    await waitFor(() => expect(screen.getByText(/recibimos su solicitud/i)).toBeTruthy());
    expect(sessionStorage.getItem('viang-quote-draft')).toBeNull();
  });

  it('fallo → mensaje con enlace de WhatsApp y el borrador se conserva', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: false, error: 'Error' }), { status: 500 })));
    render(<QuoteForm services={services} hours={hours} whatsapp="+50767340816" />);
    fillStep2AndGo();
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'María Pérez' } });
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'm@e.com' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '60000000' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    await waitFor(() => expect(screen.getByText(/su mensaje está guardado/i)).toBeTruthy());
    const wa = screen.getByRole('link', { name: /whatsapp/i });
    expect(wa.getAttribute('href')).toContain('wa.me/50767340816');
    expect(sessionStorage.getItem('viang-quote-draft')).not.toBeNull();
  });
});
