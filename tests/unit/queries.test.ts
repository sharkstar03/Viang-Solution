import { describe, it, expect } from 'vitest';
import { getServices, getServiceBySlug, getStats } from '@/lib/content/queries';
import { stackUp } from '../rls/helpers';

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

describe.runIf(up)('capa de consultas', () => {
  it('getServices devuelve los 3 publicados en orden', async () => {
    const services = await getServices();
    expect(services.map((s) => s.slug)).toEqual([
      'tratamientos-e-instalacion-de-pisos',
      'limpieza-especializada',
      'instalaciones-y-reparaciones',
    ]);
  });

  it('getServiceBySlug devuelve null para slug inexistente', async () => {
    expect(await getServiceBySlug('inexistente')).toBeNull();
  });

  it('getStats devuelve [] cuando no hay filas publicadas', async () => {
    expect(await getStats()).toEqual([]);
  });
});
