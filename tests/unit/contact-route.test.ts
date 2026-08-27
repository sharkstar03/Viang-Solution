import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de todas las dependencias del handler ──────────────
const insertMock = vi.fn<(row: Record<string, unknown>) => Promise<{ error: { message: string; code?: string } | null }>>(
  async () => ({ error: null }),
);
vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: () => ({ from: () => ({ insert: insertMock }) }),
}));
const sendMock = vi.fn<(lead: unknown) => Promise<void>>(async () => {});
vi.mock('@/lib/mailer', () => ({ sendLeadNotification: (lead: unknown) => sendMock(lead) }));
const turnstileMock = vi.fn<(token: string, ip: string) => Promise<boolean>>(async () => true);
vi.mock('@/lib/turnstile', () => ({ verifyTurnstile: (t: string, ip: string) => turnstileMock(t, ip) }));
const rateLimitMock = vi.fn<() => boolean>(() => true);
vi.mock('@/lib/rate-limit', () => ({ rateLimit: () => rateLimitMock() }));

import { POST } from '@/app/api/contact/route';

const valid = {
  name: 'María Pérez', email: 'maria@ejemplo.com', phone: '+507 6734-0816',
  service: 'pintura', message: 'Necesito cotizar pintura interior.',
  turnstileToken: 'tok_123',
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '190.34.1.2' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
  turnstileMock.mockResolvedValue(true);
  rateLimitMock.mockReturnValue(true);
  sendMock.mockResolvedValue(undefined);
});

describe('POST /api/contact', () => {
  it('payload válido → 200 y el insert corre ANTES que el email', async () => {
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(sendMock).toHaveBeenCalledOnce();
    expect(insertMock.mock.invocationCallOrder[0]).toBeLessThan(sendMock.mock.invocationCallOrder[0]);
  });

  it('si el email falla, la respuesta sigue siendo 200 (el lead ya está a salvo)', async () => {
    sendMock.mockRejectedValue(new Error('smtp caído'));
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(200);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('turnstile inválido → 400 y CERO inserts', async () => {
    turnstileMock.mockResolvedValue(false);
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rate limit excedido → 429', async () => {
    rateLimitMock.mockReturnValue(false);
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(429);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('payload inválido → 400 sin llamar a turnstile', async () => {
    const res = await POST(makeRequest({ ...valid, email: 'malo' }));
    expect(res.status).toBe(400);
    expect(turnstileMock).not.toHaveBeenCalled();
  });

  it('si el insert falla → 500 con mensaje en español sin detalles internos', async () => {
    insertMock.mockResolvedValue({ error: { message: 'db exploded at /var/lib/pg' } });
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).not.toContain('/var/lib');
  });
});
