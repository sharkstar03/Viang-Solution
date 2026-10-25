# Viangsolutions & Services — Sitio web

Sitio de [viangsolutions.com](https://viangsolutions.com): Next.js 16. El sitio
público se publica como assets estáticos en Cloudflare Workers (sin túnel y sin
servidor). Supabase y el formulario que guarda leads siguen disponibles en el
servidor Node opcional (Docker), que no hace falta para dejar la web en línea.

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
npm run lint        # ESLint (Next 16 ya no trae `next lint`)
npx tsc --noEmit    # tipos (en CI va precedido de `next typegen`)
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

## Despliegue en Cloudflare (el que usa viangsolutions.com)

Salida: carpeta `out/`. Es **solo assets estáticos** (HTML, CSS, JS, imágenes).
No hay script de Worker. `wrangler.jsonc` apunta `assets.directory` a `./out`
y el worker se llama `viangsolutions`.

```sh
npm ci
npm run build:cloudflare   # escribe ./out
npx wrangler deploy        # sube ./out. Equivale a npm run deploy:cloudflare
```

`wrangler deploy` también asocia `viangsolutions.com` y `www.viangsolutions.com`
(`routes` con `custom_domain` en `wrangler.jsonc`). Hace falta una sesión de
Wrangler en la cuenta dueña de esa zona. Este repo no incluye credenciales.

Vista previa local del mismo empaquetado, después del build:

```sh
npm run preview:cloudflare   # wrangler dev, sirve ./out
```

### Variables

Ninguna es obligatoria para el export.

| Variable | Cuándo |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Opcional en el build. Si está junto con la anon key, el export hornea las filas publicadas. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Igual que la anterior. Si faltan o la lectura falla, se usa `lib/content/fallback.ts` y el build sigue. |
| `NEXT_PUBLIC_CONTACT_PHONE` / `NEXT_PUBLIC_CONTACT_WHATSAPP` | Opcionales. Si faltan, las páginas de error usan +50767340816. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No la usa el sitio estático. El formulario abre WhatsApp. |
| `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_RECIPIENT`, `TURNSTILE_SECRET_KEY`, `ANALYTICS_SALT_SECRET` | Solo el servidor Node. El export no las lee. No hay analítica en el sitio. |
| `TUNNEL_TOKEN` | Solo el compose de Docker. |

## Servidor Node opcional (Docker + túnel)

No interviene en el despliegue de Workers. Conserva la captura de leads
(`/api/contact`) cuando hay Supabase, Turnstile y correo.

```sh
cp .env.example .env         # credenciales de producción + TUNNEL_TOKEN
docker compose up -d --build
```

Sin puertos abiertos al exterior: `cloudflared` conecta saliente hacia
Cloudflare. El healthcheck de `app` gobierna el arranque del tunnel.

## Decisiones que conviene conocer

- **Nunca se pierde un lead:** si Gmail falla, el lead ya está en la base y la
  respuesta al visitante sigue siendo éxito.
- **Secciones vacías se ocultan:** el portafolio y los testimonios de la base no se muestran si no hay filas. Las cifras no se publican. La portada sí trae la galería «Trabajos reales» con las fotos de `public/img/trabajos/`.
- **Fotos de trabajos:** antes de `npm run build:cloudflare`, coloque en `public/img/trabajos/` los JPG que lista `lib/content/service-lines.ts` (1600 px). El HTML ya apunta a esos nombres. No use las fotos de stock: el sitio ya no las referencia.
- **Logos de clientes:** la franja usa los nueve archivos `public/img/clientes/01.png`–`09.png` con el nombre aprobado como texto alternativo. Sin Supabase salen de `lib/content/fallback.ts`.
- **La IP real viene de `CF-Connecting-IP`** (detrás del Tunnel el socket
  siempre es cloudflared); el país, de `CF-IPCountry`.
- **El hero es una imagen estática, sin video** (decisión del cliente): el LCP
  móvil es una sola imagen servida por `next/image`; un test e2e vigila que
  ningún `.mp4` se descargue.
- **Turnstile sin bypass:** fail-closed, también en desarrollo.
