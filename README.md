# Viang Solutions & Service — Sitio web

Sitio de [viangsolution.com](https://viangsolution.com): Next.js 16 + Supabase,
contenido administrable, captura de leads a prueba de fallos y presupuesto de
rendimiento impuesto por CI.

**Spec y plan:** ver `docs/superpowers/specs/` y `docs/superpowers/plans/`.

## Arquitectura en una línea

Páginas estáticas/ISR leen Supabase a través de RLS → el visitante contacta por
WhatsApp, teléfono o un formulario de 3 pasos → el lead **se guarda en la base
antes** de notificar por email → todo corre en Docker (no-root, read-only)
detrás de un Cloudflare Tunnel.

## Desarrollo

```sh
npm install
cp .env.example .env.local   # completar credenciales
npm run dev                  # http://localhost:3000
```

Variables en `.env.example`. Las `NEXT_PUBLIC_*` se inlinean en build.

## Pruebas

```sh
npm run test:unit   # Vitest: validación, horarios, endpoint, componentes
npm run test:rls    # Seguridad RLS (requiere `npx supabase start`)
npm run test:e2e    # Playwright: el camino del dinero (cotización) y móvil
```

Las suites de RLS se saltan con aviso si no hay stack local de Supabase;
en CI siempre corren. Lighthouse CI impone el presupuesto: performance ≥ 95,
peso total ≤ 500 KB. **Si el sitio engorda, el build falla.**

## Base de datos

Migraciones en `supabase/migrations/`, aplicadas al proyecto
`viangsolutions` de Supabase. `supabase/seed.sql` carga el contenido inicial.
Reglas: el público solo lee filas `published`; `leads` es insert-only para
anónimos; `events` solo lo ve el service_role.

## Despliegue (VM + Docker + Cloudflare Tunnel)

```sh
cp .env.example .env         # credenciales de producción + TUNNEL_TOKEN
docker compose up -d --build
```

Sin puertos abiertos al exterior: `cloudflared` conecta saliente hacia
Cloudflare. El healthcheck de `app` gobierna el arranque del tunnel.

## Decisiones que conviene conocer

- **Nunca se pierde un lead:** si Gmail falla, el lead ya está en la base y la
  respuesta al visitante sigue siendo éxito.
- **Secciones vacías se ocultan:** portafolio, testimonios y cifras no emiten
  HTML hasta que existan filas publicadas.
- **La IP real viene de `CF-Connecting-IP`** (detrás del Tunnel el socket
  siempre es cloudflared); el país, de `CF-IPCountry`.
- **El video del hero jamás se descarga en móvil** (hay un test que lo impone).
- **Turnstile sin bypass:** fail-closed, también en desarrollo.
