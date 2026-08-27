import { describe, it, expect } from 'vitest';
import { anonClient, serviceClient, stackUp } from './helpers';

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

describe.runIf(up)('RLS: leads y events', () => {
  it('anónimo puede insertar un lead', async () => {
    const { error } = await anonClient().from('leads').insert({
      name: 'Test', email: 't@t.co', phone: '6000-0000',
      service: 'pintura', message: 'hola',
    });
    expect(error).toBeNull();
  });

  it('anónimo NO puede leer leads', async () => {
    const { data } = await anonClient().from('leads').select('*');
    expect(data ?? []).toHaveLength(0);
  });

  it('anónimo NO puede leer events', async () => {
    const { data } = await anonClient().from('events').select('*');
    expect(data ?? []).toHaveLength(0);
  });

  it('insertar un lead emite lead.created', async () => {
    await anonClient().from('leads').insert({
      name: 'Evt', email: 'e@t.co', phone: '6000-0001',
      service: 'pisos', message: 'x',
    });
    const { data } = await serviceClient()
      .from('events').select('type').eq('type', 'lead.created');
    expect(data!.length).toBeGreaterThan(0);
  });
});
