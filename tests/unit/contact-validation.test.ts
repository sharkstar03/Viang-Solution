import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/validation/contact';

const valid = {
  name: 'María Pérez',
  email: 'maria@ejemplo.com',
  phone: '+507 6734-0816',
  service: 'pintura',
  message: 'Necesito cotizar pintura interior para un apartamento.',
  turnstileToken: 'tok_123',
};

describe('contactSchema', () => {
  it('acepta una entrada válida', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('rechaza email inválido', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'no-es-email' }).success).toBe(false);
  });

  it('rechaza mensaje demasiado corto', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'corto' }).success).toBe(false);
  });

  it('rechaza teléfono con letras', () => {
    expect(contactSchema.safeParse({ ...valid, phone: 'llamame' }).success).toBe(false);
  });

  it('rechaza si falta un campo', () => {
    const { turnstileToken: _omit, ...rest } = valid;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it('acepta UTM opcionales', () => {
    expect(contactSchema.safeParse({ ...valid, utm_source: 'instagram' }).success).toBe(true);
  });
});
