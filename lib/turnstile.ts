/**
 * Verificación real de Cloudflare Turnstile — SIN bypass por entorno.
 * Fail-closed: si Cloudflare no responde, se rechaza.
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? '',
        response: token,
        remoteip: ip,
      }),
    });
    const data: { success?: boolean } = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
