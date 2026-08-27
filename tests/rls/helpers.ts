import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Servicios publicados por el seed — las pruebas cuentan contra esto. */
export const seededServiceCount = 3;

/** Cifras del negocio publicadas por el seed (contadores de la home). */
export const seededStatCount = 3;

/** Cliente anónimo: lo máximo que puede hacer un visitante del sitio. */
export function anonClient() {
  if (!anonKey) throw new Error('SUPABASE_ANON_KEY no definida — correr via npm run test:rls');
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** Cliente service_role: SOLO para asserts de tests. Jamás en código de la app cliente. */
export function serviceClient() {
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY no definida');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/**
 * ¿Está el stack local de Supabase levantado? Estas suites se saltan si no
 * (en la máquina del dueño no hay stack; en CI siempre se levanta y corren).
 */
export async function stackUp(): Promise<boolean> {
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(1500),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}
