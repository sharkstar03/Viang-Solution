import { describe, it, expect } from 'vitest';
import { anonClient, stackUp } from './helpers';

// Estas tablas nacen VACÍAS: alimentan las secciones que se ocultan solas.
const tables = ['stats', 'projects', 'testimonials'] as const;

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

describe.runIf(up)('RLS: vitrina (stats, projects, testimonials)', () => {
  for (const table of tables) {
    it(`anónimo lee 0 filas de ${table} (nace vacía)`, async () => {
      const { data, error } = await anonClient().from(table).select('id');
      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  }

  it('anónimo NO puede insertar stats', async () => {
    const { error } = await anonClient().from('stats').insert({ label: 'x', value: 1 });
    expect(error).not.toBeNull();
  });

  it('anónimo NO puede insertar projects', async () => {
    const { error } = await anonClient()
      .from('projects')
      .insert({ title: 'x', image_before: 'a', image_after: 'b' });
    expect(error).not.toBeNull();
  });

  it('anónimo NO puede insertar testimonials', async () => {
    const { error } = await anonClient()
      .from('testimonials')
      .insert({ author_name: 'x', content: 'y', rating: 5 });
    expect(error).not.toBeNull();
  });
});
