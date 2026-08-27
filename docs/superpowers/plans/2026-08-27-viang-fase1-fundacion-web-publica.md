# Viang Solution — Fase 1: Fundación + Web Pública

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el sitio estático por una aplicación Next.js desplegada tras Cloudflare Tunnel que sirve contenido desde Supabase, pesa menos de 500 KB en móvil y captura leads sin perder ninguno.

**Architecture:** Next.js 15 App Router con Server Components leyendo Supabase Postgres a través de RLS. El contenido vive en la base, no en el código. El formulario de contacto guarda el lead en la base **antes** de intentar el email, de modo que un fallo de correo nunca pierde una venta. Todo se empaqueta en una imagen Docker multi-stage que corre como usuario no-root detrás de un Cloudflare Tunnel.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Supabase (Postgres + Storage), Zod, Nodemailer, Vitest, Playwright, Docker.

**Spec:** `docs/superpowers/specs/2026-08-27-viang-solution-sitio-panel-design.md`

## Estado de ejecución — verificado el 2026-08-27

Las 16 tareas están implementadas y fusionadas en `main` (merge `a65ad23`). El cierre de la fase
(rama `chore/fase1-cierre-verificacion`) corrió la lista de aceptación completa:

| Verificación | Resultado |
|---|---|
| `npx next typegen && npx tsc --noEmit` | limpio |
| `npx eslint .` | 0 problemas (Next 16 eliminó `next lint`; 5 errores reales corregidos en el cierre) |
| Vitest unit + RLS contra `supabase start` | 63/63 |
| Playwright (Desktop Chrome + Pixel 7) | 6/6 (los 2 skips son el spec móvil en el proyecto desktop) |
| `next build` | 12 rutas: 3 servicios SSG, home/contacto ISR 5 min, `/api/*` dinámicas |
| Lighthouse móvil sobre el build local | performance 99 · accessibility 96 · best-practices 100 · SEO 100 · 367 KB · LCP 2.3 s · CLS 0.018 |
| Imagen Docker (`--read-only`, tmpfs) | `/api/health` ok · `whoami` = `app` · `touch /app/x` → Read-only file system |
| Lead con SMTP caído (stack local, secreto de prueba de Turnstile) | 200 `{ok:true}` · fila en `leads` con `ip_hash` · evento `lead.created` · log `email_failed` sin credenciales |
| Validación y rate limit | payload inválido → 400 sin insertar · 6.º POST por IP en 1 min → 429 |
| RLS contra el proyecto real con la anon key | `leads` y `events` → `[]` · insert en `services` → 401 · solo filas `published` |
| HTML de la home servido por el contenedor | 0 menciones a testimonios/portafolio · cifras presentes · 404 sin trazas |

### Desviaciones respecto al plan original

Todas registradas en git; ninguna es deuda técnica.

- **3 líneas de servicio, no 6** (`34bb9a6`): el perfil oficial de la empresa agrupa la oferta. `seededServiceCount = 3`.
- **Sin video en el hero** (`3befb64`): imagen estática por decisión del cliente; la Task 11 (ffmpeg) no aplica. El spec e2e móvil vigila que ningún `.mp4` viaje.
- **Sin `MobileActionBar`** (`e46c28b`): retirada a pedido del cliente. El hero y el menú móvil conservan WhatsApp y cotizar.
- **Presupuesto de script 160 KB, no 100 KB** (`efa3521`): Next 16 + React 19 pesan ~148 KB de base; el peso total (367 KB) sigue muy por debajo de los 500 KB.
- **`stats` ya no nace vacía** (`bc756b8`): el seed trae las 3 cifras confirmadas por el dueño; las pruebas de RLS y de consultas reflejan eso.
- **Next.js 16, no 15**: `next lint` → `eslint .`; `next-env.d.ts` fuera de git y generado con `next typegen` en CI (docs de Next 16).

### Pendiente para cerrar la fase (no es código)

- **FAQ por servicio:** `services.faq` está vacío en producción, así que no se emite `FAQPage` ni la sección. Requiere contenido del cliente.
- **Prerrequisitos del cliente (spec §18):** dominio en Cloudflare, token del Tunnel, claves de Turnstile, contraseña de aplicación de Gmail nueva, dirección y horarios reales. El `.env` de producción debe seguir `.env.example` (el actual es del sitio Express anterior).
- **Despliegue a producción en pausa** (`f9f3cf6`) hasta resolver lo anterior.

## Global Constraints

Estas reglas aplican a **todas** las tareas. Los requisitos de cada tarea las incluyen implícitamente.

- **TypeScript en modo `strict`.** Nada de `any` sin comentario que lo justifique.
- **Todo el texto de interfaz va en español** (español panameño neutro). Los nombres de código en inglés.
- **RLS activo en todas las tablas.** Ninguna tabla se crea sin políticas en la misma migración.
- **La clave `SUPABASE_SERVICE_ROLE_KEY` nunca se importa en código que llegue al navegador.** Solo en Server Components, Route Handlers y Server Actions.
- **La IP del cliente se lee de la cabecera `CF-Connecting-IP`**, nunca del socket. Detrás del Tunnel el socket siempre reporta a `cloudflared`.
- **El país se lee de la cabecera `CF-IPCountry`.** Sin librerías de geolocalización.
- **Presupuesto de rendimiento:** primera carga móvil < 500 KB, JS inicial < 100 KB, LCP < 2.5 s, CLS < 0.1, Lighthouse móvil > 95.
- **Accesibilidad WCAG 2.1 AA:** contraste mínimo 4.5:1, áreas táctiles ≥ 44 px, texto ≥ 16 px, foco visible.
- **Toda animación respeta `prefers-reduced-motion`** y ninguna retrasa la aparición del contenido.
- **Ningún mensaje de error expone rutas del sistema, consultas SQL ni credenciales.**
- **Nunca se registran credenciales en logs.**
- **Imágenes de banco** permitidas solo para fondos, texturas e iconografía. Prohibidas para portafolio, equipo o cualquier contenido que afirme ser trabajo de Viang Solution.

---

## Estructura de archivos

Cada archivo tiene una responsabilidad. Los que cambian juntos viven juntos.

```
app/
  layout.tsx                       Layout raíz: fuentes, metadatos base, barra móvil
  page.tsx                         Home: compone las secciones
  globals.css                      Tokens de Tailwind v4 y utilidades de animación
  servicios/[slug]/page.tsx        Página por servicio, generada desde la base
  contacto/page.tsx                Página del formulario
  sitemap.ts                       Sitemap generado desde la base
  robots.ts                        robots.txt
  api/
    contact/route.ts               Recibe el formulario: valida, guarda, notifica
    health/route.ts                Healthcheck para Docker y Cloudflare

components/
  ui/
    Button.tsx                     Botón con variantes
    Reveal.tsx                     Aparición al hacer scroll (IntersectionObserver)
    Counter.tsx                    Contador animado
  layout/
    Header.tsx                     Navegación
    Footer.tsx                     Pie
    MobileActionBar.tsx            Barra fija: WhatsApp, Llamar, Cotizar
    OpenNowBadge.tsx               Indicador "Abierto ahora"
  sections/
    Hero.tsx                       Portada
    TrustBar.tsx                   Logos de clientes
    Services.tsx                   Tarjetas de servicios
    About.tsx                      Quiénes somos
    Stats.tsx                      Cifras (condicional)
    Portfolio.tsx                  Antes/después (condicional)
    Testimonials.tsx               Testimonios (condicional)
    ContactCta.tsx                 Cierre con formulario
  forms/
    QuoteForm.tsx                  Formulario por pasos

lib/
  supabase/
    server.ts                      Cliente para Server Components
    admin.ts                       Cliente con service_role (solo servidor)
  content/
    queries.ts                     Todas las lecturas de contenido
  validation/
    contact.ts                     Esquema Zod del formulario
  business-hours.ts                Lógica de "abierto ahora"
  whatsapp.ts                      waLink(): arma enlaces wa.me con mensaje
  request-context.ts               Extrae IP y país de las cabeceras de Cloudflare
  rate-limit.ts                    Limitador por IP
  turnstile.ts                     Verificación con Cloudflare
  mailer.ts                        Envío de notificaciones
  seo.ts                           Datos estructurados schema.org

supabase/migrations/
  0001_content_tables.sql          site_settings, services, clients
  0002_showcase_tables.sql         stats, projects, testimonials
  0003_leads.sql                   leads + events

tests/
  unit/                            Vitest
  rls/                             Pruebas de seguridad contra Supabase local
  e2e/                             Playwright

Dockerfile
docker-compose.yml
.dockerignore
.github/workflows/ci.yml
```

**Se eliminan:** `server.js`, `index.html`, `contact.html`, `assets/js/script.js`, `assets/js/contact.js`, `assets/img/org.chromium.Chromium.sksvEK.png`.

---

### Task 1: Limpiar el repositorio y scaffolding de Next.js

El prerrequisito de todo: sacar `node_modules/` del control de versiones y crear el esqueleto del proyecto. Sin pruebas automatizadas propias — el "test" es que el build funciona.

**Files:**
- Modify: `.gitignore`
- Delete (del índice de git): `node_modules/` completo, `assets/img/org.chromium.Chromium.sksvEK.png`
- Create: proyecto Next.js 15 en la raíz (`app/`, `tsconfig.json`, `next.config.ts`, `package.json` nuevo)
- Move: `assets/img/*` → `public/img/*` (excepto la captura de Chromium)

**Interfaces:**
- Consumes: nada
- Produces: proyecto que compila con `npm run build`; assets en `public/img/`

- [ ] **Step 1: Sacar node_modules del índice**

```bash
git rm -r --cached node_modules
git rm --cached assets/img/org.chromium.Chromium.sksvEK.png
rm assets/img/org.chromium.Chromium.sksvEK.png
```

- [ ] **Step 2: Reemplazar .gitignore**

```gitignore
node_modules/
.next/
out/
.env
.env.local
*.tsbuildinfo
.DS_Store
test-results/
playwright-report/
```

- [ ] **Step 3: Commit de la limpieza (aislado, para que la historia quede legible)**

```bash
git add -A && git commit -m "chore: remove node_modules and stray screenshot from version control"
```

- [ ] **Step 4: Scaffolding**

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

Nota: `create-next-app` puede quejarse de directorio no vacío. En ese caso, generarlo en un directorio temporal y mover los archivos, conservando `docs/`, `public/` y `supabase/`.

- [ ] **Step 5: Mover assets**

```bash
mkdir -p public/img
git mv assets/img/* public/img/ 2>/dev/null || { cp -R assets/img/* public/img/ && git rm -r assets; }
```

- [ ] **Step 6: Verificar build**

Run: `npm run build`
Expected: build exitoso sin errores de tipos

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 15 app, move assets to public/"
```

---

### Task 2: Migración 0001 — contenido base con RLS + pruebas de RLS

Las tablas que alimentan el sitio y la infraestructura de pruebas de seguridad. Requiere Supabase CLI corriendo local (`npx supabase start`).

**Files:**
- Create: `supabase/migrations/0001_content_tables.sql`
- Create: `supabase/seed.sql`
- Create: `tests/rls/content.test.ts`
- Create: `tests/rls/helpers.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: nada
- Produces: tablas `site_settings`, `services`, `clients` con RLS; helper `anonClient()` y `seededServiceCount = 6` para pruebas posteriores

- [ ] **Step 1: Escribir la migración**

```sql
-- 0001_content_tables.sql
create table site_settings (
  id uuid primary key default gen_random_uuid(),
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  address text not null default '',
  business_hours jsonb not null default '{}',
  social_links jsonb not null default '{}',
  seo_title text not null default '',
  seo_description text not null default '',
  og_image text,
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  long_description text not null default '',
  icon text not null default '',
  image_path text,
  faq jsonb not null default '[]',
  price_from numeric,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text not null,
  website_url text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table services enable row level security;
alter table clients enable row level security;

-- Público: solo lectura de lo publicado. Escritura: nadie por ahora
-- (el panel de la Fase 2 agregará políticas de admin).
create policy "public read settings" on site_settings for select using (true);
create policy "public read published services" on services for select using (published = true);
create policy "public read published clients" on clients for select using (published = true);
```

- [ ] **Step 2: Seed con el contenido real del sitio actual**

`supabase/seed.sql` — los 6 servicios portados de `index.html` (títulos y descripciones textuales), los 9 clientes apuntando a `img/clientes/01.png`…`09.png`, y una fila de `site_settings` con email `vionel@viangsolution.com`, redes actuales (facebook.com/viangsolutions, instagram.com/viangsolution) y horarios lun–vie 8:00–17:00 (el spec §18 pide confirmar horarios reales; estos son el valor por defecto hasta entonces). Todos con `published = true`.

- [ ] **Step 3: Escribir las pruebas de RLS (fallan: tablas no existen)**

```typescript
// tests/rls/content.test.ts
import { describe, it, expect } from 'vitest';
import { anonClient } from './helpers';

describe('RLS: contenido', () => {
  it('anónimo lee solo servicios publicados', async () => {
    const { data, error } = await anonClient().from('services').select('slug');
    expect(error).toBeNull();
    expect(data!.length).toBe(6); // el seed publica 6
  });

  it('anónimo NO puede insertar servicios', async () => {
    const { error } = await anonClient()
      .from('services')
      .insert({ slug: 'hack', title: 'x' });
    expect(error).not.toBeNull();
  });

  it('anónimo NO puede modificar settings', async () => {
    const { data } = await anonClient()
      .from('site_settings').update({ phone: '000' }).eq('phone', '').select();
    expect(data ?? []).toHaveLength(0); // RLS silencia el update: 0 filas afectadas
  });

  it('un servicio no publicado es invisible para anónimo', async () => {
    // el seed incluye exactamente 6 publicados; si un borrador se filtrara, serían más
    const { data } = await anonClient().from('services').select('id');
    expect(data!.length).toBe(6);
  });
});
```

`tests/rls/helpers.ts` crea el cliente con `SUPABASE_URL` y `SUPABASE_ANON_KEY` del entorno local y exporta `seededServiceCount = 6`.

- [ ] **Step 4: Verificar que fallan**

Run: `npx supabase start && npx vitest run tests/rls`
Expected: FAIL — relation "services" does not exist

- [ ] **Step 5: Aplicar migración y seed**

Run: `npx supabase db reset` (aplica migraciones + seed)

- [ ] **Step 6: Verificar que pasan**

Run: `npx vitest run tests/rls`
Expected: PASS (4/4)

- [ ] **Step 7: Commit**

```bash
git add supabase tests vitest.config.ts
git commit -m "feat: content schema with RLS policies and security tests"
```

---

### Task 3: Migración 0002 — vitrina (stats, projects, testimonials)

Mismo patrón que la Task 2. Estas tablas nacen vacías: alimentan las secciones que se ocultan solas.

**Files:**
- Create: `supabase/migrations/0002_showcase_tables.sql`
- Test: `tests/rls/showcase.test.ts`

**Interfaces:**
- Consumes: `anonClient()` de `tests/rls/helpers.ts`
- Produces: tablas `stats`, `projects`, `testimonials` con RLS, vacías

- [ ] **Step 1: Migración** — `stats` (`label`, `value int`, `suffix`, `icon`), `projects` (`title`, `service_id uuid references services`, `description`, `image_before`, `image_after`, `completed_at date`), `testimonials` (`author_name`, `company`, `content`, `rating int check (rating between 1 and 5)`, `avatar_path`). Las tres con el patrón común (`sort_order`, `published`, timestamps), RLS habilitado y política `for select using (published = true)`. Sin política de escritura.

- [ ] **Step 2: Pruebas (fallan)** — anónimo lee 0 filas de cada tabla; anónimo no puede insertar en ninguna (mismo estilo que `content.test.ts`, un `it` por tabla y por operación).

- [ ] **Step 3: Verificar FAIL** — `npx vitest run tests/rls` → relation does not exist

- [ ] **Step 4: `npx supabase db reset`**

- [ ] **Step 5: Verificar PASS** — `npx vitest run tests/rls`

- [ ] **Step 6: Commit** — `git commit -m "feat: showcase tables (stats, projects, testimonials) with RLS"`

---

### Task 4: Migración 0003 — leads y events

La tabla más delicada: el público **inserta pero jamás lee**.

**Files:**
- Create: `supabase/migrations/0003_leads.sql`
- Test: `tests/rls/leads.test.ts`

**Interfaces:**
- Consumes: `anonClient()`
- Produces: tablas `leads` y `events`; trigger que emite `lead.created` en cada inserción

- [ ] **Step 1: Migración**

```sql
-- 0003_leads.sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  service text not null,
  message text not null,
  source text not null default 'form',
  status text not null default 'nuevo'
    check (status in ('nuevo','contactado','cotizado','ganado','perdido')),
  notes text,
  utm_source text, utm_medium text, utm_campaign text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null default '{}',
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;
alter table events enable row level security;

create policy "public insert leads" on leads for insert with check (true);
-- Sin política de SELECT para anónimo: los leads son invisibles al público.
-- events: sin ninguna política — solo service_role.

create or replace function emit_lead_event() returns trigger
language plpgsql security definer as $$
begin
  insert into events (type, payload)
  values ('lead.created', jsonb_build_object(
    'lead_id', new.id, 'name', new.name, 'service', new.service
  ));
  return new;
end $$;

create trigger lead_created after insert on leads
  for each row execute function emit_lead_event();
```

- [ ] **Step 2: Pruebas (fallan)**

```typescript
// tests/rls/leads.test.ts
it('anónimo puede insertar un lead', async () => {
  const { error } = await anonClient().from('leads').insert({
    name: 'Test', email: 't@t.co', phone: '6000-0000',
    service: 'pintura', message: 'hola',
  });
  expect(error).toBeNull();
});

it('anónimo NO puede leer leads', async () => {
  const { data } = await anonClient().from('leads').select('*');
  expect(data ?? []).toHaveLength(0);
});

it('anónimo NO puede leer events', async () => {
  const { data } = await anonClient().from('events').select('*');
  expect(data ?? []).toHaveLength(0);
});

it('insertar un lead emite lead.created', async () => {
  await anonClient().from('leads').insert({
    name: 'Evt', email: 'e@t.co', phone: '6000-0001',
    service: 'pisos', message: 'x',
  });
  const { data } = await serviceClient() // helper con service_role, solo en tests
    .from('events').select('type').eq('type', 'lead.created');
  expect(data!.length).toBeGreaterThan(0);
});
```

Agregar `serviceClient()` a `tests/rls/helpers.ts` usando `SUPABASE_SERVICE_ROLE_KEY` del entorno local de Supabase. Solo existe en el árbol de tests.

- [ ] **Step 3: FAIL** → **Step 4: `db reset`** → **Step 5: PASS** → **Step 6: Commit**

```bash
git commit -m "feat: leads insert-only table with event trigger and RLS tests"
```

---

### Task 5: Clientes de Supabase y capa de consultas

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/content/queries.ts`, `lib/types.ts`
- Create: `.env.example` (reemplaza el actual)
- Test: `tests/unit/queries.test.ts`

**Interfaces:**
- Consumes: esquema de las Tasks 2–4
- Produces:
  - `getSettings(): Promise<SiteSettings>`
  - `getServices(): Promise<Service[]>` — publicados, ordenados por `sort_order`
  - `getServiceBySlug(slug: string): Promise<Service | null>`
  - `getClients(): Promise<Client[]>`
  - `getStats(): Promise<Stat[]>`, `getProjects(): Promise<Project[]>`, `getTestimonials(): Promise<Testimonial[]>` — devuelven `[]` si no hay filas publicadas
  - Tipos `SiteSettings`, `Service`, `Client`, `Stat`, `Project`, `Testimonial` en `lib/types.ts`

- [ ] **Step 1: Tests contra Supabase local (fallan: módulos no existen)** — `getServices()` devuelve 6 con slugs esperados; `getServiceBySlug('inexistente')` devuelve `null`; `getStats()` devuelve `[]`.
- [ ] **Step 2: Implementar** — `server.ts` usa `@supabase/ssr` con la anon key; `admin.ts` usa `SUPABASE_SERVICE_ROLE_KEY` con `import 'server-only'` en la primera línea (garantía en build de que jamás llega al navegador); `queries.ts` concentra todas las lecturas con `unstable_cache` y tags por tabla (`revalidateTag` las invalidará desde el panel en la Fase 2).
- [ ] **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: supabase clients and cached content queries"`

`.env.example` nuevo: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_RECIPIENT=vionel@viangsolution.com`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `ANALYTICS_SALT_SECRET`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_WHATSAPP` (para las páginas de error, ver Task 14), `TUNNEL_TOKEN`.

---

### Task 6: Utilidades puras — horario, contexto de request, rate limit

Tres módulos pequeños, 100% testeables sin red.

**Files:**
- Create: `lib/business-hours.ts`, `lib/request-context.ts`, `lib/rate-limit.ts`
- Test: `tests/unit/business-hours.test.ts`, `tests/unit/request-context.test.ts`, `tests/unit/rate-limit.test.ts`

**Interfaces:**
- Consumes: tipo `BusinessHours` (jsonb de settings): `{ [day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun']: { open: string; close: string } | null }`
- Produces:
  - `isOpenNow(hours: BusinessHours, now: Date, tz?: string): { open: boolean; nextChange: string }` — tz por defecto `'America/Panama'`
  - `getRequestContext(headers: Headers): { ip: string; country: string }` — lee `CF-Connecting-IP` y `CF-IPCountry`; si faltan (desarrollo local), devuelve `'127.0.0.1'` y `'ZZ'`
  - `rateLimit(key: string, opts: { limit: number; windowMs: number }): boolean` — ventana deslizante en memoria; `true` = permitido

- [ ] **Step 1: Tests (fallan)** — `isOpenNow`: martes 10:00 → open; martes 18:00 → closed con `nextChange` = apertura del miércoles; domingo (null) → closed. `getRequestContext`: con cabeceras CF → las usa; sin ellas → valores de desarrollo. `rateLimit`: permite `limit` llamadas y rechaza la siguiente; una clave distinta no comparte cubo; pasada la ventana vuelve a permitir (usar `vi.useFakeTimers()`).
- [ ] **Step 2: Implementar** — `isOpenNow` convierte `now` a hora de Panamá con `Intl.DateTimeFormat`; rate limiter con `Map<string, number[]>` y poda de timestamps viejos.
- [ ] **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: business hours, cloudflare request context, in-memory rate limiter"`

Limitación aceptada y documentada en el código: el rate limit en memoria se reinicia con el proceso y no se comparte entre réplicas. Correcto para una VM con un contenedor; si algún día hay réplicas, se muda a Postgres.

---

### Task 7: Turnstile, mailer y validación del formulario

**Files:**
- Create: `lib/turnstile.ts`, `lib/mailer.ts`, `lib/validation/contact.ts`
- Test: `tests/unit/contact-validation.test.ts`, `tests/unit/turnstile.test.ts`

**Interfaces:**
- Consumes: nada interno
- Produces:
  - `contactSchema` (Zod): `name` 2–100, `email` válido ≤ 200, `phone` regex `^[0-9+\-\s()]{7,20}$`, `service` no vacío ≤ 100, `message` 10–2000, `turnstileToken` no vacío, `utm_source/medium/campaign` opcionales ≤ 100
  - `export type ContactInput = z.infer<typeof contactSchema>` — el tipo que consumen el mailer y la ruta de contacto
  - `verifyTurnstile(token: string, ip: string): Promise<boolean>` — **sin bypass por NODE_ENV**
  - `sendLeadNotification(lead: ContactInput): Promise<void>` — lanza si falla; el llamador decide qué hacer

- [ ] **Step 1: Tests (fallan)** — esquema: acepta entrada válida; rechaza email malo, mensaje corto, teléfono con letras, campo faltante. Turnstile: mockear `fetch` con `vi.stubGlobal`; éxito → true; `success:false` → false; **fetch lanza → false** (fail-closed: si Cloudflare no responde, se rechaza).
- [ ] **Step 2: Implementar** — `verifyTurnstile` hace POST a `https://challenges.cloudflare.com/turnstile/v0/siteverify` con `secret`, `response` y `remoteip`. `mailer.ts` porta el transporte Gmail de `server.js` (host smtp.gmail.com, 465, secure) y el HTML del email **con el mismo `escapeHtml`** del servidor actual; destinatario desde `CONTACT_RECIPIENT`. Sin log de `EMAIL_USER`.
- [ ] **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: contact validation, fail-closed turnstile, lead mailer"`

---

### Task 8: Route Handlers — /api/contact y /api/health

El corazón del flujo de leads. **El lead se guarda antes de intentar el email.**

**Files:**
- Create: `app/api/contact/route.ts`, `app/api/health/route.ts`
- Test: `tests/unit/contact-route.test.ts`

**Interfaces:**
- Consumes: `contactSchema`, `verifyTurnstile`, `sendLeadNotification`, `rateLimit`, `getRequestContext`, cliente de `lib/supabase/admin.ts`
- Produces:
  - `POST /api/contact` → `{ ok: true }` | `{ ok: false, error: string }` (mensajes en español)
  - `GET /api/health` → `{ status: 'ok' }` 200

Orden estricto dentro del handler:

1. `rateLimit(ip, { limit: 5, windowMs: 60_000 })` → si excede, 429 "Demasiados intentos. Espere un minuto."
2. `contactSchema.safeParse` → si falla, 400 con el primer error legible
3. `verifyTurnstile(token, ip)` → si falla, 400 "Verificación de seguridad inválida"
4. **Insertar en `leads`** (con `ip_hash` = SHA-256 de ip + `ANALYTICS_SALT_SECRET`, y UTM si vinieron) → si falla, 500 "No pudimos registrar su solicitud" — único caso de error real
5. `sendLeadNotification` en `try/catch`: **si el email falla, la respuesta sigue siendo `{ ok: true }`** — el lead ya está a salvo y el trigger ya emitió el evento; se loggea `console.error('email_failed', { leadId })` sin credenciales

- [ ] **Step 1: Tests (fallan)** — mockear las dependencias con `vi.mock`; casos: payload válido → 200 e insert llamado **antes** que el mailer (verificar orden con `mock.invocationCallOrder`); email lanza → **igual 200**; turnstile false → 400 y **cero** inserts; sexta llamada misma IP en 1 min → 429; payload inválido → 400 sin llamar turnstile.
- [ ] **Step 2: Implementar** → **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: contact endpoint saves lead before email, health check"`

---

### Task 9: Sistema de diseño — tokens, Button, Reveal, Counter

**Files:**
- Create: `app/globals.css` (tokens), `components/ui/Button.tsx`, `components/ui/Reveal.tsx`, `components/ui/Counter.tsx`
- Test: `tests/unit/ui.test.tsx` (Testing Library + jsdom)

**Interfaces:**
- Consumes: nada
- Produces:
  - Tokens CSS (Tailwind v4 `@theme`): `--color-primary: #0B3C5D` (azul profundo), `--color-primary-light: #1D6FA5`, `--color-accent: #F59E0B` (ámbar CTA), `--color-surface: #F8FAFC`, `--color-ink: #0F172A`; tipografía Inter vía `next/font` (autoalojada, sin CDN); radios `--radius-card: 1rem`; sombra difusa única
  - `<Button variant="primary|secondary|whatsapp" size="md|lg" asChild?>`
  - `<Reveal delay?={ms}>` — `opacity` + `translateY(16px)`, 300 ms, IntersectionObserver `threshold: 0.15`, una sola vez; **si `prefers-reduced-motion`, renderiza visible sin animación**
  - `<Counter to={number} suffix?={string}>` — anima al entrar en viewport; con reduced-motion muestra el valor final directo

- [ ] **Step 1: Tests (fallan)** — Button renderiza como `<a>` con `asChild` dentro de un link; Reveal con `matchMedia` mockeado a reduced-motion no aplica clase de animación; Counter con reduced-motion muestra el valor final inmediatamente.
- [ ] **Step 2: Implementar** — animación 100% CSS (la clase se agrega al intersecar); contraste verificado: primary sobre blanco 8.6:1, accent #F59E0B reservado para superficies grandes con texto ink (4.6:1).
- [ ] **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: design tokens and animated ui primitives"`

---

### Task 10: Layout — Header, Footer, MobileActionBar, OpenNowBadge

**Files:**
- Create: `components/layout/Header.tsx`, `Footer.tsx`, `MobileActionBar.tsx`, `OpenNowBadge.tsx`, `lib/whatsapp.ts`
- Modify: `app/layout.tsx`
- Test: `tests/unit/layout.test.tsx`

**Interfaces:**
- Consumes: `getSettings()`, `isOpenNow()`, `Button`
- Produces: layout raíz que recibe settings una vez y los distribuye; helper exportado `waLink(phone: string, text: string): string` → `https://wa.me/<phone-digits>?text=<encoded>` en `lib/whatsapp.ts`

- [ ] **Step 1: Tests (fallan)** — `waLink('+507 6000-0000', 'Hola')` → `https://wa.me/50760000000?text=Hola` (dígitos solos, texto codificado). MobileActionBar renderiza 3 enlaces: `wa.me`, `tel:`, `#cotizar`, cada uno con `aria-label` y área ≥ 44px (clase `min-h-11`). OpenNowBadge abierto → "Abierto ahora · respondemos en minutos"; cerrado → "Te respondemos {nextChange}".
- [ ] **Step 2: Implementar** — Header: logo + nav (Servicios, Quiénes somos, Contacto) + hamburguesa en móvil; sticky con fondo al hacer scroll. MobileActionBar: `fixed bottom-0`, `md:hidden`, con `padding-bottom: env(safe-area-inset-bottom)`; el layout compensa con padding para no tapar el footer. Footer: contacto, redes desde settings, año dinámico.
- [ ] **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: site layout with thumb-zone mobile action bar"`

---

### Task 11: Optimización de assets

Sin pruebas unitarias — el criterio es el peso medido, verificado aquí y protegido por Lighthouse CI en la Task 15.

**Files:**
- Modify: `public/img/*` (recompresión), `public/video/limpieza-web.mp4` (nuevo)
- Create: `public/img/hero-mobile.jpg` (fotograma del video u otra imagen del repo, ~60 KB AVIF/JPEG progresivo)

**Interfaces:**
- Consumes: assets movidos en Task 1
- Produces: presupuesto cumplible: hero móvil ≤ 60 KB, cada imagen de servicio ≤ 120 KB, video ≤ 2.5 MB solo escritorio

- [ ] **Step 1: Comprimir el video** — `ffmpeg -i public/img/limpieza.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart public/video/limpieza-web.mp4` (sin audio: es de fondo). Verificar ≤ 2.5 MB. Si ffmpeg no está: `brew install ffmpeg`.
- [ ] **Step 2: Extraer fotograma para móvil** — `ffmpeg -i public/video/limpieza-web.mp4 -ss 2 -frames:v 1 -q:v 3 public/img/hero-mobile.jpg`
- [ ] **Step 3: Recomprimir imágenes pesadas** — con `sharp-cli` (`npx sharp-cli`): `PISOS.jpg` 6.9 MB → ≤ 150 KB @1600px; `breadcrumb.png` → JPEG ≤ 120 KB; `white-logo.png` y `presentacion del logo.png` → ≤ 80 KB; renombrar `presentacion del logo.png` a `presentacion-logo.png` (sin espacios). Los logos de clientes 01–09 → ≤ 30 KB c/u. `next/image` hará la conversión final a AVIF por tamaño de pantalla.
- [ ] **Step 4: Borrar originales pesados** — `rm public/img/limpieza.mp4` (queda solo la versión web) y verificar: `du -sh public` ≤ 5 MB total.
- [ ] **Step 5: Commit** — `git commit -m "perf: compress video 13MB->2.5MB, images to web budgets"`

---

### Task 12: Secciones de la home + página principal

**Files:**
- Create: `components/sections/Hero.tsx`, `TrustBar.tsx`, `Services.tsx`, `About.tsx`, `Stats.tsx`, `Portfolio.tsx`, `Testimonials.tsx`, `ContactCta.tsx`
- Modify: `app/page.tsx`
- Test: `tests/unit/sections.test.tsx`

**Interfaces:**
- Consumes: todas las queries de la Task 5, `Reveal`, `Counter`, `Button`, `waLink`, `OpenNowBadge`
- Produces: home completa; **contrato de secciones condicionales**: `Stats`, `Portfolio` y `Testimonials` reciben sus datos por props y devuelven `null` si el array está vacío

- [ ] **Step 1: Tests (fallan)** — `Stats({ stats: [] })` renderiza `null` (igual Portfolio y Testimonials); `Services` renderiza 6 tarjetas con `href="/servicios/{slug}"`; Hero contiene un CTA `wa.me` y uno `#cotizar`.
- [ ] **Step 2: Implementar Hero** — móvil: `hero-mobile.jpg` como imagen de fondo con `next/image` `priority` (es el LCP); escritorio (`md:`): `<video autoplay muted loop playsinline preload="none" poster=...>` cargado solo vía media query en un componente cliente que consulta `matchMedia('(min-width: 768px)')` — **el video jamás se descarga en móvil**. Overlay oscuro para contraste AA del titular.
- [ ] **Step 3: Implementar el resto** — TrustBar: logos en grilla con grayscale → color al hover, sin carrusel JS (CSS `animation` de desplazamiento continuo, pausada con reduced-motion). Services: tarjetas con `Reveal` escalonado (`delay={i * 80}`). About: texto actual + `equipo.jpg`. ContactCta: ancla `#cotizar`, integra el formulario de la Task 13 (placeholder `<div id="cotizar">` hasta entonces).
- [ ] **Step 4: `app/page.tsx`** — Server Component: obtiene todo en paralelo con `Promise.all`, pasa props. Las tres condicionales simplemente no emiten HTML si están vacías.
- [ ] **Step 5: PASS + build** — `npx vitest run && npm run build`
- [ ] **Step 6: Commit** — `git commit -m "feat: home sections with conditional rendering and desktop-only video"`

---

### Task 13: Formulario de cotización por pasos

**Files:**
- Create: `components/forms/QuoteForm.tsx`
- Modify: `components/sections/ContactCta.tsx` (integrar), `app/contacto/page.tsx` (crear)
- Test: `tests/unit/quote-form.test.tsx`, `tests/e2e/quote.spec.ts` (se ejecuta en Task 15)

**Interfaces:**
- Consumes: `POST /api/contact` (Task 8), `contactSchema` (reutilizado en cliente para validación instantánea), lista de servicios por props
- Produces: formulario de 3 pasos: (1) servicio — tarjetas seleccionables, (2) mensaje, (3) nombre + email + teléfono + Turnstile

Comportamientos obligatorios:

- Estado persistido en `sessionStorage` en cada cambio: **si la red falla o la página se recarga, lo escrito se conserva** (spec §13)
- Al fallar el envío: mensaje "No pudimos enviar su solicitud. Su mensaje está guardado — intente de nuevo o escríbanos por WhatsApp" con botón `wa.me` que lleva el texto ya escrito
- Turnstile con el widget oficial, cargado **solo al llegar al paso 3** (no pesa en la carga inicial); **sin `dummy-token`, sin bypass**
- Éxito: reemplaza el formulario por confirmación con el indicador de horario ("Le respondemos hoy" / "mañana a las 8:00") y limpia `sessionStorage`
- Barra de progreso con `aria-valuenow`; labels reales, errores bajo cada campo, `aria-invalid`

- [ ] **Step 1: Tests de componente (fallan)** — paso 1 muestra los servicios; no avanza sin selección; datos escritos aparecen en `sessionStorage`; respuesta `ok:false` muestra el mensaje con enlace WhatsApp; respuesta `ok:true` muestra confirmación.
- [ ] **Step 2: Implementar** → **Step 3: PASS** → **Step 4: Commit** — `git commit -m "feat: three-step quote form with draft persistence and wa fallback"`

---

### Task 14: Páginas de servicio, contacto, SEO y errores

**Files:**
- Create: `app/servicios/[slug]/page.tsx`, `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/error.tsx`
- Test: `tests/unit/seo.test.ts`

**Interfaces:**
- Consumes: `getServiceBySlug`, `getServices`, `getSettings`, `QuoteForm`, `waLink`
- Produces:
  - `/servicios/[slug]` con `generateStaticParams` (SSG de los 6) y `generateMetadata` por servicio
  - `serviceJsonLd(service, settings)` y `localBusinessJsonLd(settings)` y `faqJsonLd(faq)` en `lib/seo.ts`

- [ ] **Step 1: Tests (fallan)** — `serviceJsonLd` produce `@type: "Service"` con `provider` LocalBusiness; `faqJsonLd` con 2 preguntas produce `FAQPage` con 2 `mainEntity`; con `faq: []` devuelve `null` (no se emite script vacío).
- [ ] **Step 2: Página de servicio** — hero compacto con la imagen del servicio, descripción larga, FAQ como `<details>` accesible (sin JS), CTA WhatsApp con mensaje pre-armado `Hola, me interesa {title}`, QuoteForm con el servicio preseleccionado, JSON-LD en `<script type="application/ld+json">`. Slug inexistente → `notFound()`.
- [ ] **Step 3: Errores que no pierden ventas** — `not-found.tsx` y `error.tsx`: mensaje amable en español + botones de WhatsApp y `tel:`. Decisión: como `error.tsx` es un client component que debe funcionar **incluso si la base de datos está caída**, sus CTA leen `NEXT_PUBLIC_CONTACT_PHONE` y `NEXT_PUBLIC_CONTACT_WHATSAPP` (inlineados en build, agregados a `.env.example`). Es una duplicación deliberada del dato: la página de error no puede depender de `getSettings()`. Sin stack traces.
- [ ] **Step 4: sitemap + robots** — sitemap desde `getServices()` + rutas fijas; robots permite todo salvo `/api/`.
- [ ] **Step 5: PASS + build** → **Step 6: Commit** — `git commit -m "feat: service pages with structured data, friendly error pages"`

---

### Task 15: E2E, presupuesto de rendimiento y CI

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/quote.spec.ts`, `tests/e2e/mobile.spec.ts`, `lighthouserc.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: la aplicación completa
- Produces: CI que falla si se rompe la funcionalidad o el presupuesto

- [ ] **Step 1: E2E del camino del dinero** — `quote.spec.ts`: completa los 3 pasos (Turnstile en modo test key de Cloudflare `1x00000000000000000000AA` que siempre pasa, solo en entorno de test), intercepta `/api/contact`, verifica confirmación; recarga a mitad del paso 2 y verifica que el texto persiste. `mobile.spec.ts` (viewport iPhone): la MobileActionBar es visible, sus 3 enlaces tienen los `href` correctos; **ninguna petición de red trae el video** (`page.on('request')`).
- [ ] **Step 2: Lighthouse CI** — `lighthouserc.json`: preset móvil contra el build de producción local; aserciones: performance ≥ 0.95, accessibility ≥ 0.95, `total-byte-weight` ≤ 500 KB, `resource-summary:script:size` ≤ 100 KB. Falla el build si no cumple.
- [ ] **Step 3: Workflow** — jobs: (1) lint + `tsc --noEmit`, (2) `npm audit --audit-level=high`, (3) unit (Vitest), (4) RLS contra `supabase start` en el runner, (5) build + Lighthouse CI, (6) Playwright. En push y PR a main.
- [ ] **Step 4: Verificar todo local** — `npx vitest run && npx playwright test && npm run build` → todo verde.
- [ ] **Step 5: Commit** — `git commit -m "ci: e2e money-path tests and enforced performance budget"`

---

### Task 16: Docker endurecido + Tunnel y limpieza final

**Files:**
- Modify: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `README.md`
- Delete: `server.js`, `index.html`, `contact.html`, `assets/` (ya migrado)

**Interfaces:**
- Consumes: build standalone de Next (`output: 'standalone'` en `next.config.ts`)
- Produces: `docker compose up` sirve el sitio; contenedor no-root, solo lectura

- [ ] **Step 1: Dockerfile multi-stage**

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: docker-compose con Tunnel**

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    env_file: .env
    read_only: true
    tmpfs: [/tmp]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${TUNNEL_TOKEN}
    depends_on:
      app:
        condition: service_healthy
```

- [ ] **Step 3: .dockerignore** — `node_modules`, `.next`, `.git`, `.env*`, `.claude`, `docs`, `tests`, `supabase`, `*.md`
- [ ] **Step 4: Borrar lo viejo** — `git rm server.js index.html contact.html` y `git rm -r assets` si quedó algo; quitar `express`, `cors`, `axios`, `nodemon` de `package.json`
- [ ] **Step 5: Verificar** — `docker build -t viang . && docker run --rm -p 3000:3000 --env-file .env viang` → `curl localhost:3000/api/health` responde `{"status":"ok"}`; `docker exec` confirma `whoami` = `app`
- [ ] **Step 6: README nuevo** — setup local (supabase start, npm run dev), variables de entorno, despliegue con compose + token del Tunnel, cómo correr las pruebas
- [ ] **Step 7: Commit final** — `git commit -m "feat: hardened docker deploy with cloudflare tunnel, remove legacy site"`

---

## Verificación final de la fase

Al terminar las 16 tareas, correr la lista de aceptación del spec §17 que aplica a esta fase:

- [x] `npx vitest run` — unit + RLS verdes (63/63, 2026-08-27)
- [x] `npx playwright test` — e2e verdes (6/6)
- [x] Lighthouse móvil ≥ 95 y peso < 500 KB (CI lo impone) — performance 99, 367 KB
- [x] Lead con email caído (apagar `EMAIL_PASS`) → igual queda en `leads` y responde ok — verificado contra el stack local con `EMAIL_PASS` inválida
- [x] `docker compose up` → sitio arriba, `whoami` = app, healthcheck verde — verificado con la imagen y los mismos flags (`--read-only`, tmpfs); `compose` completo espera el `.env` de producción y el token del Tunnel
- [x] Anónimo vía API REST de Supabase no lee `leads` ni borradores — sondeado contra el proyecto real
- [x] Secciones vacías ausentes del HTML (`curl | grep -c testimonial` = 0) — 0 en el HTML del contenedor

Lo que queda para las fases siguientes: panel admin (Fase 2), analítica con `page_views` (Fase 2), webhooks salientes y tokens de servicio (Fase 3). El linktree quedó descartado por el cliente (spec §4 y §11).
