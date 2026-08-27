import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('permite hasta el límite y rechaza la siguiente', () => {
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit('a', opts)).toBe(true);
    expect(rateLimit('a', opts)).toBe(true);
    expect(rateLimit('a', opts)).toBe(true);
    expect(rateLimit('a', opts)).toBe(false);
  });

  it('claves distintas no comparten cubo', () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit('b', opts)).toBe(true);
    expect(rateLimit('c', opts)).toBe(true);
  });

  it('pasada la ventana vuelve a permitir', () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit('d', opts)).toBe(true);
    expect(rateLimit('d', opts)).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(rateLimit('d', opts)).toBe(true);
  });
});
