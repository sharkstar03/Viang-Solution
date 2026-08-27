import { describe, it, expect } from 'vitest';
import { getRequestContext } from '@/lib/request-context';

describe('getRequestContext', () => {
  it('usa las cabeceras de Cloudflare cuando existen', () => {
    const h = new Headers({ 'CF-Connecting-IP': '190.34.1.2', 'CF-IPCountry': 'PA' });
    expect(getRequestContext(h)).toEqual({ ip: '190.34.1.2', country: 'PA' });
  });

  it('sin cabeceras (desarrollo local) usa valores de fallback', () => {
    expect(getRequestContext(new Headers())).toEqual({ ip: '127.0.0.1', country: 'ZZ' });
  });
});
