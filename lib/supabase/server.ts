import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de solo lectura con la clave anónima: lo que puede ver el público,
 * filtrado por RLS. Para Server Components y Route Handlers.
 */
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}
