import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto').max(100),
  email: z.string().trim().email('Email inválido').max(200),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Teléfono inválido'),
  service: z.string().trim().min(1, 'Seleccione un servicio').max(100),
  message: z.string().trim().min(10, 'Cuéntenos un poco más (mínimo 10 caracteres)').max(2000),
  turnstileToken: z.string().min(1, 'Complete la verificación de seguridad'),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
