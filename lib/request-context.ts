/**
 * Contexto del visitante detrás de Cloudflare Tunnel.
 * El socket SIEMPRE reporta a cloudflared: la IP real viene en
 * CF-Connecting-IP y el país en CF-IPCountry. Sin esas cabeceras
 * (desarrollo local) se usan valores de fallback.
 */
export function getRequestContext(headers: Headers): { ip: string; country: string } {
  return {
    ip: headers.get('CF-Connecting-IP') ?? '127.0.0.1',
    country: headers.get('CF-IPCountry') ?? 'ZZ',
  };
}
