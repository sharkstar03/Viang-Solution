/**
 * Limitador por clave con ventana deslizante, en memoria.
 *
 * Limitación aceptada: se reinicia con el proceso y no se comparte entre
 * réplicas. Correcto para una VM con un solo contenedor; si algún día hay
 * réplicas, mudar el estado a Postgres.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): boolean {
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  if (hits.length >= opts.limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
