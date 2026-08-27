import { describe, it, expect, vi, afterEach } from 'vitest';
import { verifyTurnstile } from '@/lib/turnstile';

afterEach(() => vi.unstubAllGlobals());

describe('verifyTurnstile', () => {
  it('true cuando Cloudflare responde success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: true }))));
    expect(await verifyTurnstile('tok', '1.2.3.4')).toBe(true);
  });

  it('false cuando Cloudflare responde success:false', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: false }))));
    expect(await verifyTurnstile('tok', '1.2.3.4')).toBe(false);
  });

  it('false cuando la red falla (fail-closed)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('red caída'); }));
    expect(await verifyTurnstile('tok', '1.2.3.4')).toBe(false);
  });
});
