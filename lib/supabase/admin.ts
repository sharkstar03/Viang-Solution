import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con service_role: salta RLS. SOLO servidor — el import de
 * 'server-only' rompe el build si esto llega a un Client Component.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}
