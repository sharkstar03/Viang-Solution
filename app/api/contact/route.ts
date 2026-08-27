import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { contactSchema } from '@/lib/validation/contact';
import { verifyTurnstile } from '@/lib/turnstile';
import { sendLeadNotification } from '@/lib/mailer';
import { rateLimit } from '@/lib/rate-limit';
import { getRequestContext } from '@/lib/request-context';
import { supabaseAdmin } from '@/lib/supabase/admin';

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.ANALYTICS_SALT_SECRET ?? ''))
    .digest('hex');
}

/**
 * Recibe el formulario de cotización.
 * Orden estricto: rate limit → validación → turnstile → GUARDAR LEAD → email.
 * El email es una notificación: si falla, el lead ya está a salvo y la
 * respuesta sigue siendo ok.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const { ip } = getRequestContext(request.headers);

  if (!rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { ok: false, error: 'Demasiados intentos. Espere un minuto.' },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Datos inválidos';
    return NextResponse.json({ ok: false, error: first }, { status: 400 });
  }
  const { turnstileToken, ...lead } = parsed.data;

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json(
      { ok: false, error: 'Verificación de seguridad inválida. Intente nuevamente.' },
      { status: 400 },
    );
  }

  // 1) Guardar el lead — la fuente de verdad. El trigger emite lead.created.
  const { error: dbError } = await supabaseAdmin().from('leads').insert({
    ...lead,
    source: 'form',
    ip_hash: hashIp(ip),
    user_agent: request.headers.get('user-agent') ?? undefined,
  });
  if (dbError) {
    console.error('lead_insert_failed', { code: dbError.code });
    return NextResponse.json(
      { ok: false, error: 'No pudimos registrar su solicitud. Intente de nuevo o escríbanos por WhatsApp.' },
      { status: 500 },
    );
  }

  // 2) Notificar — best effort: un fallo de correo nunca pierde la venta.
  try {
    await sendLeadNotification(lead);
  } catch {
    console.error('email_failed: lead guardado, notificación pendiente');
  }

  return NextResponse.json({ ok: true });
}
