import { describe, it, expect } from 'vitest';
import { anonClient, seededServiceCount, stackUp } from './helpers';

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

describe.runIf(up)('RLS: contenido', () => {
  it('anónimo lee solo servicios publicados', async () => {
    const { data, error } = await anonClient().from('services').select('slug');
    expect(error).toBeNull();
    expect(data!.length).toBe(seededServiceCount);
  });

  it('anónimo NO puede insertar servicios', async () => {
    const { error } = await anonClient()
      .from('services')
      .insert({ slug: 'hack', title: 'x' });
    expect(error).not.toBeNull();
  });

  it('anónimo NO puede modificar settings', async () => {
    const { data } = await anonClient()
      .from('site_settings').update({ phone: '000' }).neq('phone', 'x').select();
    expect(data ?? []).toHaveLength(0); // RLS silencia el update: 0 filas afectadas
  });

  it('un servicio no publicado es invisible para anónimo', async () => {
    // el seed publica exactamente 6; si un borrador se filtrara, serían más
    const { data } = await anonClient().from('services').select('id');
    expect(data!.length).toBe(seededServiceCount);
  });
});
