# Viang Solution — Fase 2a: Panel administrativo, acceso y leads

**Fecha:** 2026-08-27 · **Estado:** diseño aprobado en conversación, pendiente de revisión escrita
**Spec padre:** `2026-08-27-viang-solution-sitio-panel-design.md` (§6 seguridad, §7 datos, §9 panel, §13 errores, §16 pruebas)
**Fase previa:** Fase 1 verificada y fusionada en `main` (`a7298d8`)

## 1. Resumen y alcance

La Fase 2 del spec padre reúne cinco subsistemas independientes (acceso, leads, editor de
contenido, analítica, PWA + push). Se parte en sub-proyectos con su propio spec → plan → merge.
**2a** es el primero: el dueño y su equipo entran al panel con 2FA y gestionan los leads.

### Decisiones tomadas en el brainstorming (2026-08-27)

| Decisión | Elegido |
|---|---|
| Partición de la Fase 2 | 2a acceso + leads → 2b editor de contenido → 2c analítica → 2d PWA/push. Citas se difiere al Producto 2 |
| Usuarios del panel | Dueño + 1–2 personas, **mismos permisos** (un solo rol `admin`) |
| Leads | Se gestionan los del formulario **y** se dan de alta a mano (llamadas, WhatsApp directo) |
| Enfoque técnico | Mismo app Next.js en `/admin`, con **shadcn/ui** para los componentes del panel |

### Dentro de 2a

- Login con email + contraseña y **TOTP obligatorio** en cada inicio de sesión
- Panel móvil primero con tres secciones: **Inicio · Leads · Seguridad**
- Leads: lista con filtros y búsqueda, detalle con estado y notas, alta manual, responder por
  WhatsApp, llamar, reintentar notificación, exportar CSV, historial de cambios
- `audit_log` alimentado por triggers (base del "deshacer" de 2b)
- Cabeceras de seguridad para todo el sitio
- Migración de claves de Supabase a *publishable/secret*
- Reestructura del árbol `app/` en grupos `(site)` y `admin`

### Fuera de 2a

Editor de contenido y Storage (2b), analítica (2c), PWA y push (2d), citas, webhooks y tokens
de servicio (Fase 3), CSP con nonce (trabajo aparte: Turnstile y los scripts inline de Next),
gestión de usuarios y roles desde el panel, modo oscuro.

---

## 2. Arquitectura

### Árbol de rutas

```
app/
  layout.tsx                    raíz: <html>, fuentes, globals.css — sin Header/Footer
  (site)/
    layout.tsx                  layout público: Header, Footer, revalidate = 300
    page.tsx, contacto/, servicios/[slug]/, sitemap.ts, robots.ts, not-found.tsx, error.tsx
  admin/
    layout.tsx                  envoltorio `.admin` + Toaster; `dynamic = 'force-dynamic'`
    error.tsx                   error del panel, sin trazas
    actions.ts                  signOut
    (auth)/layout.tsx           tarjeta centrada, sin shell
    (auth)/login/page.tsx + LoginForm.tsx + actions.ts
    (auth)/2fa/page.tsx + TotpGate.tsx
    (panel)/layout.tsx          requireAdmin() + Shell con navegación
    (panel)/page.tsx            Inicio
    (panel)/leads/page.tsx      lista
    (panel)/leads/nuevo/page.tsx  alta manual
    (panel)/leads/[id]/page.tsx   detalle
    (panel)/leads/actions.ts    Server Actions de leads
    (panel)/leads/export/route.ts GET → CSV
    (panel)/seguridad/page.tsx + actions.ts
  api/contact/route.ts          (sin cambio de ruta; escribe notified_at / notify_error)
  api/health/route.ts
proxy.ts                        sesión, aal2 y cabeceras
components/
  admin/ui/                     componentes shadcn (alias "ui" en components.json)
  admin/                        Shell, NavBar, LeadCard, LeadTable, StatusBadge, LeadForm…
lib/
  supabase/server.ts            sin cambios: cliente sin sesión para el sitio público (páginas estáticas)
  supabase/session.ts           createServerClient con cookies — solo el panel
  supabase/browser.ts           createBrowserClient (solo MFA y logout)
  supabase/admin.ts             sin cambios: service_role / secret key, solo servidor
  supabase/database.types.ts    generado con `supabase gen types`
  admin/session.ts              requireAdmin(): claims + aal2, o redirect
  admin/leads.ts                consultas de leads (lista, detalle, cifras)
  admin/csv.ts                  serialización CSV
  admin/phone.ts                normalizePanamaPhone()
  admin/whatsapp-reply.ts       mensaje pre-armado
  validation/lead-manual.ts     Zod del alta manual
scripts/create-admin.mjs        crea usuario admin local/CI con secret key (JS plano, sin tooling extra)
supabase/migrations/0004_admin_access.sql
```

Las URLs públicas no cambian: los grupos entre paréntesis no aparecen en la ruta.

### Clientes de Supabase

- **`@supabase/ssr`** (dependencia nueva, versión fijada) y `@supabase/supabase-js` pasa de
  `devDependencies` a `dependencies` (hoy está mal clasificada).
- `lib/supabase/session.ts` crea `createServerClient` con `cookies()` de Next (`getAll`/`setAll`
  con try/catch: los Server Components no escriben cookies; el proxy sí). `server.ts` no se toca:
  las páginas públicas son estáticas/ISR y leer cookies las volvería dinámicas.
- `proxy.ts` refresca la sesión llamando `supabase.auth.getClaims()` en cada petición de `/admin/*`
  y aplica las cabeceras de caché que `setAll` entrega, para que ninguna respuesta con cookies de
  sesión quede en caché.
- Identidad **siempre** con `getClaims()` (verifica la firma del JWT); `getSession()` nunca decide
  autorización. `getUser()` solo cuando se necesita el registro fresco (pantalla Seguridad).
- El sitio público sigue leyendo con el cliente sin sesión (anon → publishable): las páginas son
  estáticas/ISR y no deben depender de cookies.

### Claves

Se adoptan las claves nuevas de Supabase: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (navegador y
lecturas públicas) y `SUPABASE_SECRET_KEY` (solo servidor). Se renombran en `.env.example`,
`.env.test`, `Dockerfile`, `docker-compose.yml`, `ci.yml` y `tests/rls/helpers.ts`. Las claves
legacy `anon`/`service_role` siguen funcionando en Supabase; el código acepta ambas variables
durante la transición (`PUBLISHABLE_KEY ?? ANON_KEY`) y el README documenta las nuevas.

---

## 3. Acceso al panel

### Sesión

- Cookies `httpOnly` + `Secure` + `SameSite=Lax`, JWT de 1 h con rotación de refresh
  (`config.toml` ya lo fija). Nada en `localStorage`.
- `proxy.ts` corre en todas las rutas (por las cabeceras de seguridad, ver más abajo) y aplica la
  lógica de sesión **solo** cuando la ruta empieza por `/admin`:
  - sin claims válidos → `redirect /admin/login`
  - claims con `aal = 'aal1'` → `redirect /admin/2fa` (salvo que ya esté en `/admin/2fa`)
  - `/admin/login` con sesión `aal2` → `redirect /admin`
- `lib/admin/session.ts` → `requireAdmin()` repite la comprobación dentro de cada Server
  Component y Server Action (defensa en profundidad: el proxy es la primera capa, no la única).
- El TOTP se pide en **cada inicio de sesión**. Un refresh de token conserva `aal2`.
- "Cerrar sesión en todos los dispositivos" = `auth.signOut({ scope: 'global' })`.

### Login (`/admin/login`)

Server Action `signIn(formData)`: `rateLimit('login:' + ip, { limit: 5, windowMs: 60_000 })` con
la IP de `CF-Connecting-IP` → Zod (email, contraseña) → `signInWithPassword` → redirect a
`/admin/2fa`. Error único: "Credenciales inválidas" (no revela si el email existe). Enlace
"Olvidé mi contraseña" → `resetPasswordForEmail` con `redirectTo` a `/admin/seguridad` (el proxy exige el TOTP antes).

### Segundo factor (`/admin/2fa`)

Componente cliente con `createBrowserClient`:

- Sin factor (`listFactors()` vacío): `mfa.enroll({ factorType: 'totp', friendlyName: 'Panel Viang' })`
  → se muestra `totp.qr_code` (SVG que entrega Supabase, sin librería) y `totp.secret` en texto
  para carga manual → `mfa.challenge({ factorId })` → `mfa.verify({ factorId, challengeId, code })`.
- Con factor: `challenge` + `verify` con el código de la app.
- Tras `verify` el navegador recibe el JWT `aal2`; `router.refresh()` y redirect a `/admin`.
- No existe ruta que permita usar el panel en `aal1`: las políticas RLS lo impiden aunque el
  proxy fallara.

### Usuarios

- `enable_signup = false` en `config.toml` y en el dashboard. Sin registro público.
- Los 2–3 usuarios se crean con **Invitar usuario** desde el dashboard de Supabase (funciona con
  el registro cerrado). El nombre viaja en los metadatos de la invitación.
- Trigger en `auth.users` crea la fila de `profiles` (`role = 'admin'`). Los metadatos del
  usuario se usan **solo para el nombre a mostrar**, jamás para autorizar.
- Sin gestión de usuarios en el panel (fuera de alcance).

### Intentos fallidos

Dos capas:

1. **Por IP, en la app**: el limitador en memoria de la Fase 1 (`lib/rate-limit.ts`) en el Server
   Action de login: 5 intentos por minuto por IP. Frena la fuerza bruta desde una IP antes de
   tocar Supabase. Detrás del Tunnel, Cloudflare puede sumar una regla de rate limiting sobre
   `POST /admin/login`.
2. **Por usuario, en Supabase**: Auth Hook *password verification attempt*
   (`public.hook_password_verification_attempt(event jsonb) returns jsonb`): registra cada
   intento en `audit_log` (`login.ok` / `login.failed`) y, con **5 fallos en 15 minutos**,
   responde `decision: 'reject'` durante 15 minutos con el mensaje "Demasiados intentos. Espere
   15 minutos." (`should_logout_user: false`). Se activa en `config.toml`
   (`[auth.hook.password_verification_attempt] enabled = true, uri = "pg-functions://postgres/public/hook_password_verification_attempt"`)
   y en el dashboard para producción. Permisos: `grant execute` a `supabase_auth_admin` (quien lo invoca) y a `service_role`
   (para las pruebas); `revoke` de `anon`, `authenticated` y `public`; `grant insert, select` sobre
   `audit_log` a `supabase_auth_admin` para que el hook escriba y cuente.

**Trade-off aceptado.** Supabase advierte que el hook corre en peticiones no autenticadas: alguien
que conozca el email del dueño puede provocarle un bloqueo de 15 minutos. Con 2–3 usuarios, el
limitador por IP y Cloudflare delante, se prefiere el bloqueo (que detiene el adivinado
distribuido) a una simple demora. Si el bloqueo malicioso ocurriera, el registro en `audit_log`
lo evidencia y el dueño puede entrar por WhatsApp/teléfono con sus leads mientras tanto: el
sitio y la captura de leads no dependen del panel.

### Cabeceras de seguridad

`proxy.ts` agrega en todas las respuestas (matcher ampliado a todo salvo `_next/static`,
`_next/image`, `favicon.ico` y `public/`): `Strict-Transport-Security: max-age=63072000;
includeSubDomains; preload`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(),
microphone=(), geolocation=()`, `Content-Security-Policy: frame-ancestors 'none'` (solo esa
directiva; la CSP completa con nonce queda fuera). Se verifican con un test de integración
sobre el proxy.

---

## 4. Modelo de datos — `0004_admin_access.sql`

Se mantiene la convención numérica de la Fase 1 (`000N_nombre.sql`), imperativa, con RLS en
el mismo archivo y pruebas de RLS escritas antes que el código. Todas las políticas usan
`(select auth.uid())` y `(select auth.jwt())` (una evaluación por consulta, no por fila) y
`to authenticated` / `to anon` explícitos.

### Esquema `private`

Funciones `security definer` fuera del esquema expuesto, con `set search_path = ''` y
`revoke execute … from public, anon, authenticated`:

- `private.audit_row()` — función de trigger: inserta en `audit_log` (`table_name`, `record_id`,
  `action` = `insert|update|delete`, `before`/`after` = `to_jsonb(old/new)`, `user_id` =
  `auth.uid()`). Solo puede ejecutarse como trigger.
- `private.handle_new_user()` — trigger `after insert on auth.users`: inserta `profiles`
  (`user_id`, `full_name` desde `raw_user_meta_data->>'full_name'`, `role = 'admin'`).
- `private.guard_public_lead()` — trigger `before insert on leads`: si `(select auth.uid()) is null`
  (alta anónima por REST o por el endpoint público con la clave anon) fuerza `source = 'form'`,
  `status = 'nuevo'`, `notes = null`, `created_by = null`. Si hay usuario, fija `created_by =
  auth.uid()`. Nunca se usa `auth.role()` (deprecado).

### `profiles`

```sql
create table profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin')),
  full_name  text not null default '',
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "own profile" on profiles for select to authenticated
  using (user_id = (select auth.uid()));
-- sin políticas de escritura: solo el trigger y el dashboard
```

`role` admite un solo valor hoy; ampliar el `check` no requiere migrar datos.

### `public.is_admin()`

`security invoker`, `stable`, `language sql`:

```sql
select exists (
  select 1 from profiles
  where user_id = (select auth.uid()) and role = 'admin'
) and coalesce((select auth.jwt()) ->> 'aal', 'aal1') = 'aal2';
```

Funciona bajo RLS gracias a la política "own profile". Es la única condición de todas las
políticas del panel: sin TOTP verificado, un admin no lee ni un lead.

### `audit_log`

```sql
create table audit_log (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users (id) on delete set null,
  table_name text not null,
  record_id  text not null,
  action     text not null,          -- insert | update | delete | login.ok | login.failed
  before     jsonb,
  after      jsonb,
  ip_hash    text,
  created_at timestamptz not null default now()
);
alter table audit_log enable row level security;
create policy "admin reads audit" on audit_log for select to authenticated
  using ((select is_admin()));
-- sin insert/update/delete desde clientes: escriben los triggers y el hook
create index audit_log_record_idx on audit_log (table_name, record_id, created_at desc);
create index audit_log_created_idx on audit_log (created_at desc);
```

Trigger `audit_leads after insert or update or delete on leads for each row execute function
private.audit_row()`. En 2b se cuelga a las tablas de contenido y ahí nace "deshacer".

### `leads`, cambios

```sql
alter table leads
  alter column email set default '',
  add column notified_at  timestamptz,
  add column notify_error text,
  add column created_by   uuid references auth.users (id) on delete set null,
  add column updated_at   timestamptz not null default now(),
  add constraint leads_source_check check (source in ('form','whatsapp','call','agent'));
create index leads_created_idx on leads (created_at desc);
create index leads_status_idx  on leads (status);

create policy "admin reads leads"   on leads for select to authenticated using ((select is_admin()));
create policy "admin inserts leads" on leads for insert to authenticated with check ((select is_admin()));
create policy "admin updates leads" on leads for update to authenticated
  using ((select is_admin())) with check ((select is_admin()));
create policy "admin deletes leads" on leads for delete to authenticated using ((select is_admin()));
-- "public insert leads" (Fase 1) se conserva; se le añade `to anon`
```

Trigger `set_updated_at` (before update). El endpoint público de contacto escribe
`notified_at` al enviar el email o `notify_error` (mensaje sin credenciales) si falla; el panel
muestra "notificación pendiente" y ofrece reintentar.

### Hook de contraseña

`public.hook_password_verification_attempt(event jsonb) returns jsonb` (`security definer`,
`set search_path = ''`): inserta en `audit_log` (`user_id`, `action`), cuenta `login.failed`
del usuario en los últimos 15 min y decide. Permisos como se describe en §3.

### Tipos

`supabase gen types typescript --local > lib/supabase/database.types.ts`, regenerado en cada
migración (script `npm run db:types`). Solo los clientes del panel (`session.ts`, `admin.ts`) se tipan
con `Database`; el cliente público y `lib/types.ts` no cambian para no tocar la Fase 1.

---

## 5. Pantallas y navegación

Móvil primero. Barra inferior en móvil (**Inicio · Leads · Seguridad**), barra lateral en
escritorio. Encabezado con nombre del usuario y "Salir". Solo tema claro. Todo en español.
Accesibilidad como el sitio: áreas ≥ 44 px, foco visible, labels reales, `aria-invalid`.

### Componentes

shadcn/ui inicializado con `components.json` apuntando `ui` a `components/admin/ui` (evita
colisión con `components/ui/Button.tsx` del sitio en un sistema de archivos que no distingue
mayúsculas). Componentes: `button`, `input`, `label`, `textarea`, `select`, `badge`, `card`,
`table`, `dialog`, `sheet`, `sonner`. Sus variables CSS se añaden a `globals.css` bajo el
selector `.admin` (aplicado en el layout del panel) para no alterar el sitio público. Primario =
azul del sitio (`--color-primary`). Formularios con Server Actions + `useActionState`; sin
react-hook-form.

### `/admin/login` y `/admin/2fa`

Descritos en §3. Ambos sin el shell del panel (grupo `(auth)`).

### `/admin` — Inicio

Tres cifras (`lib/admin/leads.ts › getLeadCounts()`): leads **nuevos** (`status = 'nuevo'`),
leads de los últimos 7 días, notificaciones pendientes (`notify_error is not null and
notified_at is null`). Debajo, los últimos 5 leads como tarjetas. Sin gráficos (2c).

### `/admin/leads` — lista

Tabla en escritorio, tarjetas en móvil. Parámetros en la URL (`?estado=&q=&pagina=`):
filtro por estado, búsqueda por nombre, teléfono o email (`ilike` sobre las tres columnas),
orden por fecha descendente, **25 por página** con `range()` en el servidor. Botones **Nuevo
lead** y **Exportar CSV** (`/admin/leads/export?estado=&q=`; respeta el filtro activo).
Cada fila: nombre, servicio, origen, estado (badge), fecha relativa, aviso si la notificación
falló.

### `/admin/leads/[id]` — detalle

Datos, origen, UTM, `user_agent` resumido, fecha. Acciones:

- **Estado**: select con `nuevo → contactado → cotizado → ganado | perdido` (cualquier
  transición permitida; el orden es sugerido, no impuesto).
- **Notas**: textarea, guardar explícito.
- **Responder por WhatsApp**: `waLink(normalizePanamaPhone(lead.phone), mensaje)`; mensaje:
  "Hola {nombre}, le escribimos de Viang Solution por su solicitud de {servicio}. ¿Le parece si
  coordinamos una visita?". Si el teléfono no se puede normalizar (menos de 7 dígitos), el botón
  no aparece y se muestra el teléfono tal cual.
- **Llamar**: `tel:` con el número normalizado.
- **Reintentar notificación**: visible solo si `notify_error is not null and notified_at is null`.
- **Historial**: filas de `audit_log` del lead (quién, qué campo cambió, cuándo), últimas 20.

### `/admin/leads/nuevo` — alta manual

Campos: nombre (2–100), teléfono (7–20, regex de la Fase 1), email (opcional; se guarda `''`),
servicio (select: los 3 publicados + "Otro" con texto libre ≤ 100), origen (`whatsapp` |
`call`), mensaje (≥ 3 caracteres; menos exigente que el formulario público), estado inicial
(`nuevo` | `contactado`). Zod en `lib/validation/lead-manual.ts`. Al guardar → redirect al
detalle con aviso. `created_by` lo fija el trigger.

### `/admin/seguridad`

Cuenta (nombre, email), cambiar contraseña (`updateUser`, exige la sesión `aal2`), factor TOTP
(estado; **regenerar** = `unenroll` + nueva inscripción, pidiendo un código vigente primero),
**cerrar sesión en todos los dispositivos**, últimos 20 accesos desde `audit_log`
(`login.ok`/`login.failed` del propio usuario, con fecha y resultado).

---

## 6. Flujo de datos

- **Lectura**: Server Components con el cliente de sesión; RLS aplica en cada consulta. Ninguna
  lectura del panel usa la secret key.
- **Escritura**: Server Actions en `app/admin/leads/actions.ts` — `createLead`, `updateLeadStatus`,
  `updateLeadNotes`, `retryNotification` — y en `app/admin/seguridad/actions.ts` —
  `changePassword`, `signOutEverywhere`. Cada una: `requireAdmin()` → Zod → operación con el
  cliente de sesión → `revalidatePath('/admin/leads')` y `revalidatePath('/admin/leads/[id]', 'page')`
  → resultado `{ ok, error? }` para `useActionState`.
- **CSV**: Route Handler `GET /admin/leads/export` con `requireAdmin()`, misma consulta que la
  lista (sin paginar, tope 10 000 filas), `text/csv; charset=utf-8` con BOM, nombre
  `leads-AAAA-MM-DD.csv`, generado en streaming (`ReadableStream`) para no cargar todo en memoria.
  Columnas: fecha, nombre, teléfono, email, servicio, origen, estado, mensaje, notas, utm_source,
  utm_medium, utm_campaign.
- **Reintento de notificación**: `sendLeadNotification(lead)` (Fase 1) → éxito: `notified_at =
  now(), notify_error = null`; fallo: `notify_error` actualizado. El email se envía con el
  transporte existente; el lead no cambia de estado.
- **Endpoint público** (`/api/contact`): tras insertar (con `.select('id').single()`), intenta el
  email y actualiza `notified_at` o `notify_error` con la secret key. El contrato de respuesta
  no cambia.
- **Login y 2FA**: descritos en §3. El login corre en el servidor (Server Action) para que el
  limitador por IP y Cloudflare lo cubran; la inscripción/verificación TOTP corre en el
  navegador porque es quien debe recibir el JWT `aal2` en las cookies.

---

## 7. Manejo de errores

- Avisos en español y accionables con `sonner`; errores de campo bajo cada campo.
- Los mensajes de PostgREST/Postgres nunca llegan a la UI: se mapean por código (`23505`
  duplicado, `42501`/RLS → "No tiene permiso", resto → "No se pudo guardar. Intente de nuevo").
- `app/admin/error.tsx`: mensaje genérico + "Reintentar" + "Ir a Inicio"; sin trazas.
- Logs estructurados sin credenciales (`console.error('lead_update_failed', { code })`).
- Supabase caído: el panel muestra su página de error; el sitio público sigue sirviéndose por
  ISR y la captura de leads responde 500 solo si la inserción falla (comportamiento Fase 1).
- Sesión expirada a mitad de una acción: la Server Action devuelve `{ ok: false, error:
  'Su sesión expiró' }` y el cliente redirige a `/admin/login`.

---

## 8. Pruebas (TDD: prueba antes que código)

### RLS — `tests/rls/admin.test.ts`

`beforeAll`: crea con la secret key (`auth.admin.createUser`, `email_confirm: true`) dos
usuarios de prueba y, para uno, inscribe y verifica un factor TOTP generando el código con
`otpauth` (devDependency) a partir del `secret` que devuelve `enroll`. Casos:

- anónimo no lee `profiles` ni `audit_log`
- anónimo inserta un lead con `status = 'ganado'`, `source = 'agent'`, `notes = 'x'` y queda
  guardado como `nuevo` / `form` / `notes null` (trigger `guard_public_lead`)
- sesión `aal1` (solo contraseña) no lee leads (0 filas) ni actualiza (0 filas)
- sesión `aal2` lee, crea (con `created_by` = su id), actualiza y exporta
- actualizar un lead deja una fila en `audit_log` con `before`/`after`
- el hook: invocado con `rpc()` y la secret key con 5 eventos `valid = false`
  del mismo `user_id` responde `continue` las 5 primeras veces y `reject` la sexta; con
  `valid = true` tras el bloqueo también `reject`; pasados 15 min (se insertan filas con
  `created_at` antiguo) vuelve a `continue`

### Unitarias — `tests/unit/`

- `phone.test.ts`: `normalizePanamaPhone('6000-0000') = '+50760000000'`; con `+507` ya presente
  no duplica; menos de 7 dígitos → `null`.
- `csv.test.ts`: escapes de comas, comillas y saltos de línea; BOM inicial; encabezados fijos.
- `lead-manual.test.ts`: acepta email vacío; rechaza origen `form`; "Otro" exige texto.
- `whatsapp-reply.test.ts`: mensaje con nombre y servicio, codificado en la URL.
- `proxy.test.ts`: cabeceras presentes; sin sesión → redirect a login; `aal1` → redirect a 2fa
  (con `getClaims` mockeado).

### Integración

- `contact-route.test.ts` (Fase 1) gana dos casos: email ok → `notified_at` escrito; email falla →
  `notify_error` escrito y respuesta sigue `{ ok: true }`.

### E2E — `tests/e2e/admin.spec.ts` (segundo camino del dinero)

`globalSetup` ejecuta `scripts/create-admin.mjs` contra el stack local (crea `admin@test.local`
con contraseña conocida y factor TOTP; guarda el secreto en `test-results/admin-totp.json`).
Casos:

- anónimo en `/admin/leads` → termina en `/admin/login`
- login → `/admin/2fa` → código generado con `otpauth` → Inicio muestra las cifras
- abre un lead del seed de pruebas, cambia estado a `contactado`, guarda nota → la lista lo
  refleja y el historial muestra el cambio
- "Exportar CSV" descarga un archivo que contiene el lead

Playwright levanta el servidor de desarrollo contra el stack local (variables de `.env.test`), así que
`npm run test:e2e` requiere `npx supabase start`; en CI el job `build-and-budget` ya lo levanta.

### Lighthouse

Sin cambios: mide `/`. El panel no entra en el presupuesto del sitio público; se comprueba en
la revisión de código que ningún componente de `components/admin/` se importe desde `(site)`.

---

## 9. Cambios sobre la Fase 1

| Cambio | Motivo |
|---|---|
| `app/(site)/` con el layout público; layout raíz mínimo | el panel no lleva Header/Footer |
| `@supabase/supabase-js` a `dependencies`; `@supabase/ssr` y `otpauth` (dev) fijados | SSR con cookies; TOTP en pruebas |
| Nuevo `lib/supabase/session.ts` (`createServerClient` con cookies) para el panel; `server.ts` intacto | las páginas públicas estáticas no pueden leer cookies |
| Claves publishable/secret con compatibilidad legacy | recomendación vigente de Supabase; rotación sin cambiar el JWT secret |
| `/api/contact` escribe `notified_at`/`notify_error` | alerta de email fallido en el panel |
| `proxy.ts` nuevo | sesión + cabeceras |
| `config.toml`: `enable_signup = false`, `[auth.mfa.totp]` habilitado, hook activado | seguridad del panel |
| `ci.yml`: `npm run db:types --check` (tipos al día) y e2e del panel | protección continua |
| README: panel, usuarios, 2FA, script de admin, claves nuevas | operación |

---

## 10. Criterios de aceptación de 2a

- [ ] Sin sesión, `/admin/*` redirige a login; con contraseña pero sin TOTP, a `/admin/2fa`
- [ ] Un usuario sin factor lo inscribe en el primer acceso y no puede ver el panel antes
- [ ] Con el JWT `aal1`, una consulta directa a la API REST con esa sesión devuelve 0 leads
- [ ] 5 contraseñas incorrectas seguidas bloquean el usuario 15 min y quedan en `audit_log`
- [ ] Un lead del formulario aparece en Inicio como "nuevo" sin desplegar nada
- [ ] Cambiar estado y notas desde el celular tarda un toque cada uno y queda en el historial
- [ ] Alta manual de un lead por llamada, con email vacío, queda registrada con `created_by`
- [ ] "Responder por WhatsApp" abre la conversación con el mensaje pre-armado
- [ ] Si el email del lead falló, el panel lo muestra y "Reintentar" lo envía
- [ ] "Exportar CSV" con filtro de estado descarga solo esos leads y abre bien en Excel
- [ ] Un anónimo no puede crear leads "ganados" ni con notas por la API REST
- [ ] Todas las respuestas del sitio llevan las cabeceras de seguridad de §3
- [ ] Lighthouse móvil del sitio público no baja: performance ≥ 95, peso < 500 KB
- [ ] `npx vitest run` (unit + RLS) y `npx playwright test` en verde en local con el stack y en CI

---

## 11. Prerrequisitos y configuración en el dashboard de Supabase (producción)

- Authentication → Sign In: **desactivar registro** (`Allow new users to sign up`)
- Authentication → MFA: **TOTP habilitado**, máximo de factores 10 (valor por defecto)
- Authentication → Hooks: **Password verification attempt** → función
  `public.hook_password_verification_attempt`
- Authentication → SMTP: **SMTP propio** (Gmail con la contraseña de aplicación nueva) para
  invitaciones y recuperación de contraseña; el SMTP por defecto de Supabase está limitado
- Authentication → URL Configuration: `Site URL = https://viangsolution.com`, redirect
  `https://viangsolution.com/admin/**`
- Settings → API Keys: crear **publishable** y **secret**; la secret solo va al `.env` de la VM
- Invitar a los 2–3 usuarios (Authentication → Users → Invite) con `full_name` en los metadatos
- Aplicar `0004_admin_access.sql` con `supabase db push` (proyecto vinculado) antes de desplegar

---

## 12. Decisiones registradas

| Decisión | Razón |
|---|---|
| TOTP en cada inicio de sesión | El spec padre exige 2FA obligatorio; con 2–3 usuarios el costo es un código por sesión |
| Un solo rol `admin` | Mismos permisos para todos; el `check` se amplía sin migrar datos si hace falta |
| Login en Server Action, TOTP en el navegador | El login debe pasar por nuestro rate limit y Cloudflare; el `aal2` debe llegar a las cookies del navegador |
| `is_admin()` sin `security definer` | `profiles` deja leer la propia fila; se evita una función privilegiada en el esquema expuesto |
| Funciones `security definer` en esquema `private` | Recomendación de Supabase: fuera del esquema expuesto, con `search_path` vacío y `execute` revocado |
| Bloqueo de 15 min tras 5 fallos (no solo demora) | Detiene el adivinado distribuido; el riesgo de bloqueo malicioso queda mitigado y documentado en §3 |
| Trigger que normaliza altas anónimas | La política pública de insert sigue siendo `with check (true)`; el trigger impide fabricar leads "ganados" |
| Claves publishable/secret | Recomendación vigente de Supabase; las legacy siguen aceptadas durante la transición |
| shadcn en `components/admin/ui` y tema bajo `.admin` | Evita colisiones con los primitivos del sitio y no toca su CSS ni su peso |
| CSV por streaming con tope de 10 000 filas | Sin cargar todo en memoria; el tope evita exportaciones accidentales enormes |
| CSP con nonce fuera de 2a | Turnstile y los scripts inline de Next la vuelven un trabajo propio; `frame-ancestors` sí entra |

## 13. Lo que sigue

2b editor de contenido (mismo `audit_row()` para deshacer; Storage con recorte;
`revalidatePath` de las páginas públicas) → 2c analítica → 2d PWA + push (el trigger
`lead.created` ya existe).
