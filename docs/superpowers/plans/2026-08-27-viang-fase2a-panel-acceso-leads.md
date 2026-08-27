# Viang Solution — Fase 2a: Panel de acceso y leads — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El dueño y su equipo entran a `/admin` con contraseña + TOTP obligatorio y gestionan los leads (ver, filtrar, cambiar estado, anotar, responder por WhatsApp, dar de alta a mano, exportar CSV) desde el celular, con todo cambio auditado.

**Architecture:** Mismo app Next.js 16. El árbol `app/` se parte en `(site)` (público, estático/ISR, cliente sin sesión) y `admin/` (dinámico, cliente con cookies vía `@supabase/ssr`). `proxy.ts` exige sesión `aal2` en `/admin/*` y agrega cabeceras de seguridad a todo el sitio. Una migración (`0004_admin_access.sql`) crea `profiles`, `audit_log`, `is_admin()`, triggers de auditoría y el hook de bloqueo; todas las políticas del panel usan `is_admin()` = perfil admin **y** JWT `aal2`. Server Components leen y Server Actions escriben con el cliente de sesión (RLS aplica); la secret key sigue reservada al endpoint público de contacto.

**Tech Stack:** Next.js 16.3 (App Router, `proxy.ts`, Server Actions), React 19, TypeScript strict, Tailwind v4, shadcn/ui (Radix), Supabase (Auth + MFA TOTP + Auth Hooks + Postgres RLS), `@supabase/ssr`, Zod 4, Vitest 4, Playwright 1.62, `otpauth` (tests).

**Spec:** `docs/superpowers/specs/2026-08-27-viang-fase2a-panel-acceso-leads-design.md`

## Global Constraints

Copiadas del spec y de la Fase 1; aplican a todas las tareas.

- **TypeScript `strict`.** Nada de `any` sin comentario que lo justifique.
- **Texto de interfaz en español** (panameño neutro). Identificadores en inglés.
- **RLS en todas las tablas nuevas, en la misma migración.** Políticas con `(select auth.uid())` / `(select auth.jwt())` y `to authenticated` / `to anon` explícitos. Nunca `auth.role()`.
- **La secret key / `service_role` jamás llega al navegador** ni a ninguna lectura del panel. Solo `lib/supabase/admin.ts` (endpoint de contacto, reintento de email) y scripts de prueba.
- **Identidad solo con `getClaims()`.** `getSession()` nunca decide autorización.
- **Sin TOTP verificado (`aal2`) no se lee ni un lead**, ni por proxy ni por RLS.
- **IP de `CF-Connecting-IP`** (`getRequestContext`), nunca del socket.
- **Sin registro público:** `enable_signup = false` local y en el dashboard.
- **Ningún mensaje de error expone rutas, SQL ni credenciales; ningún log registra credenciales.**
- **Accesibilidad AA:** áreas táctiles ≥ 44 px (`min-h-11`), foco visible, labels reales, `aria-invalid`.
- **El sitio público no cambia de peso:** nada de `components/admin/` ni de `lib/admin/` se importa desde `app/(site)` ni `components/{sections,layout,forms,ui}`. Lighthouse móvil sigue ≥ 95 / < 500 KB.
- **Dependencias fijadas** (`--save-exact`) y lockfile commiteado.
- **Migraciones con la convención numérica de la Fase 1:** `supabase/migrations/000N_nombre.sql`.
- **Commits pequeños por tarea**, mensajes en inglés con prefijo `feat:`/`test:`/`chore:`/`docs:`.

---

## Estructura de archivos

```
app/
  layout.tsx                          raíz mínima: <html>, fuentes, globals.css, metadata
  not-found.tsx                       404 global (importa Header/Footer explícitamente)
  sitemap.ts, robots.ts, favicon.ico, api/
  (site)/
    layout.tsx                        Header + Footer + revalidate = 300
    page.tsx, contacto/, servicios/, error.tsx      (movidos, sin cambios)
  admin/
    layout.tsx                        .admin + Toaster; dynamic = 'force-dynamic'
    error.tsx
    actions.ts                        signOut
    (auth)/layout.tsx                 tarjeta centrada
    (auth)/login/page.tsx, LoginForm.tsx, actions.ts
    (auth)/2fa/page.tsx, TotpGate.tsx
    (panel)/layout.tsx                requireAdmin() + Shell
    (panel)/page.tsx                  Inicio
    (panel)/leads/page.tsx, LeadFilters.tsx
    (panel)/leads/nuevo/page.tsx, LeadForm.tsx
    (panel)/leads/[id]/page.tsx, LeadActions.tsx, LeadHistory.tsx
    (panel)/leads/actions.ts
    (panel)/leads/export/route.ts
    (panel)/seguridad/page.tsx, TotpManage.tsx, PasswordForm.tsx, actions.ts
proxy.ts
components/admin/ui/                  shadcn (button, input, label, textarea, select, badge, card, table, dialog, sheet, sonner)
components/admin/Shell.tsx, NavBar.tsx, LeadTable.tsx, LeadCard.tsx, StatusBadge.tsx
lib/utils.ts                          cn() (lo crea shadcn)
lib/supabase/env.ts                   supabaseUrl(), supabasePublicKey(), supabaseSecretKey()
lib/supabase/session.ts               supabaseSession() — cookies, solo panel
lib/supabase/browser.ts               supabaseBrowser()
lib/supabase/database.types.ts        generado
lib/admin/session.ts                  getAdminSession(), requireAdmin()
lib/admin/leads.ts                    listLeads, listAllLeads, getLead, getLeadCounts, getLeadHistory
lib/admin/phone.ts                    normalizePanamaPhone()
lib/admin/whatsapp-reply.ts           leadReplyMessage(), leadWhatsAppLink()
lib/admin/csv.ts                      toCsv()
lib/admin/errors.ts                   friendlyDbError()
lib/validation/lead-manual.ts         manualLeadSchema, leadStatusSchema, LEAD_STATUSES
scripts/create-admin.mjs
supabase/migrations/0004_admin_access.sql
supabase/migrations/0005_password_hook.sql
tests/rls/auth-helpers.ts, admin.test.ts, hook.test.ts
tests/unit/supabase-env.test.ts, admin-utils.test.ts, proxy.test.ts, admin-session.test.ts,
           admin-shell.test.tsx, login-action.test.ts, admin-leads.test.ts, lead-table.test.tsx,
           leads-export.test.ts, lead-actions.test.ts, security-actions.test.ts
tests/e2e/global-setup.ts, admin.spec.ts
```

---

### Task 1: Reestructurar `app/` en `(site)` y raíz mínima

El panel no lleva Header/Footer del sitio. Se mueven las páginas públicas a un grupo de rutas con su propio layout. Las URLs no cambian.

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/(site)/layout.tsx`
- Move: `app/page.tsx` → `app/(site)/page.tsx`; `app/contacto/` → `app/(site)/contacto/`; `app/servicios/` → `app/(site)/servicios/`; `app/error.tsx` → `app/(site)/error.tsx`
- Modify: `app/not-found.tsx`

**Interfaces:**
- Consumes: `Header`, `Footer`, `getSettings()`, `getServices()` (Fase 1)
- Produces: `app/(site)/layout.tsx` con `export const revalidate = 300`; layout raíz sin `revalidate`

- [ ] **Step 1: Mover archivos**

```bash
mkdir -p "app/(site)"
git mv app/page.tsx "app/(site)/page.tsx"
git mv app/contacto "app/(site)/contacto"
git mv app/servicios "app/(site)/servicios"
git mv app/error.tsx "app/(site)/error.tsx"
```

- [ ] **Step 2: Layout público**

```tsx
// app/(site)/layout.tsx
import { getServices, getSettings } from '@/lib/content/queries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// ISR: las páginas públicas se regeneran cada 5 minutos; el panel invalida al guardar (2b).
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
      <Header />
      {children}
      <Footer settings={settings} services={services} />
    </>
  );
}
```

- [ ] **Step 3: Layout raíz mínimo** — reemplazar `app/layout.tsx` completo:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getSettings } from '@/lib/content/queries';
import './globals.css';

// next/font descarga Inter en build y la sirve desde el propio dominio.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seo_title, template: `%s · Viang Solution` },
    description: s.seo_description,
    metadataBase: new URL('https://viangsolution.com'),
    openGraph: { title: s.seo_title, description: s.seo_description, locale: 'es_PA', type: 'website' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-white font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: 404 con Header/Footer explícitos** — en `app/not-found.tsx`, convertir en `async function NotFound()`, obtener `const [settings, services] = await Promise.all([getSettings(), getServices()]);` e importar `Header`/`Footer`; envolver el `<main>` actual: `<><Header />{main}<Footer settings={settings} services={services} /></>`. El contenido del `<main>` no cambia.

- [ ] **Step 5: Verificar**

Run: `npm run build 2>&1 | grep -E "○|●|ƒ|error"`
Expected: las mismas 12 rutas que antes (`/`, `/contacto`, `/servicios/...` ×3, `/api/*`, `/sitemap.xml`, `/robots.txt`, `/_not-found`); sin errores.

Run: `npx vitest run tests/unit && npx playwright test`
Expected: unit en verde; e2e 6 passed (el sitio no cambió).

- [ ] **Step 6: Commit**

```bash
git add -A app && git commit -m "refactor: split app tree into (site) group with minimal root layout"
```

---

### Task 2: Dependencias y claves de Supabase

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `lib/supabase/env.ts`
- Modify: `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `tests/rls/helpers.ts`, `.env.example`, `.env.test`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`, `README.md`
- Test: `tests/unit/supabase-env.test.ts`

**Interfaces:**
- Produces: `supabaseUrl(): string`, `supabasePublicKey(): string` (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY`), `supabaseSecretKey(): string` (`SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY`); todas lanzan `Error` con el nombre de la variable que falta.

- [ ] **Step 1: Instalar** (versiones exactas; anotar la de `@supabase/ssr` que quede en `package.json`)

```bash
npm install --save-exact --save-prod @supabase/supabase-js@2.112.4 @supabase/ssr@latest
npm install --save-exact --save-dev otpauth@latest
grep -n "@supabase\|otpauth" package.json   # supabase-js debe estar en dependencies, no en devDependencies
```

- [ ] **Step 2: Test (falla)**

```ts
// tests/unit/supabase-env.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { supabasePublicKey, supabaseSecretKey, supabaseUrl } from '@/lib/supabase/env';

afterEach(() => vi.unstubAllEnvs());

describe('env de Supabase', () => {
  it('prefiere la publishable key y cae a la anon key', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    expect(supabasePublicKey()).toBe('sb_publishable_x');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    expect(supabasePublicKey()).toBe('anon');
  });

  it('prefiere la secret key y cae a service_role', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_x');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
    expect(supabaseSecretKey()).toBe('sb_secret_x');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    expect(supabaseSecretKey()).toBe('svc');
  });

  it('lanza con el nombre de la variable si falta', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(() => supabaseUrl()).toThrow('NEXT_PUBLIC_SUPABASE_URL');
  });
});
```

Run: `npx vitest run tests/unit/supabase-env.test.ts` → FAIL (módulo no existe)

- [ ] **Step 3: Implementar**

```ts
// lib/supabase/env.ts
/** Lectura única de las variables de Supabase. Acepta las claves nuevas
 *  (publishable/secret) y cae a las legacy (anon/service_role). */
function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Falta ${name}`);
  return value;
}

export function supabaseUrl(): string {
  return required(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
}

export function supabasePublicKey(): string {
  return required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );
}

export function supabaseSecretKey(): string {
  return required(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    'SUPABASE_SECRET_KEY',
  );
}
```

`lib/supabase/server.ts` y `lib/supabase/admin.ts`: reemplazar la lectura de `process.env` por `supabaseUrl()` / `supabasePublicKey()` / `supabaseSecretKey()`; el resto igual.

`tests/rls/helpers.ts`: `const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';` y `const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';`.

- [ ] **Step 4: Configuración**
  - `.env.example`: bajo Supabase, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...` y `SUPABASE_SECRET_KEY=sb_secret_...   # SOLO servidor`; dejar las legacy comentadas con `# compatibilidad:`.
  - `.env.test`: ejecutar `npx supabase start && npx supabase status`; si imprime `Publishable key` y `Secret key`, agregarlas como `SUPABASE_PUBLISHABLE_KEY=` y `SUPABASE_SECRET_KEY=`. Si no las imprime, no agregar nada (las demo legacy siguen funcionando).
  - `Dockerfile`: agregar `ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `docker-compose.yml`: agregar el mismo build arg.
  - `README.md`: en "Desarrollo", una línea: "Claves: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` (las legacy anon/service_role siguen aceptadas)".
  - `ci.yml`: sin cambios (usa las demo legacy).

- [ ] **Step 5: Verificar** — `npx vitest run tests/unit && npx tsc --noEmit && npm run build` → verde.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: supabase ssr dependency, publishable/secret keys with legacy fallback"
```

---

### Task 3: Migración `0004_admin_access.sql` + pruebas de RLS del panel

**Files:**
- Modify: `supabase/config.toml` (`enable_signup`, `[auth.mfa.totp]`)
- Create: `supabase/migrations/0004_admin_access.sql`
- Create: `tests/rls/auth-helpers.ts`, `tests/rls/admin.test.ts`

**Interfaces:**
- Consumes: `anonClient()`, `serviceClient()`, `stackUp()` de `tests/rls/helpers.ts`
- Produces:
  - tablas `profiles`, `audit_log`; función `public.is_admin()`; triggers `audit_leads`, `guard_public_lead`, `set_updated_at`, `on_auth_user_created`
  - columnas nuevas en `leads`: `notified_at timestamptz`, `notify_error text`, `created_by uuid`, `updated_at timestamptz`; `email default ''`; `source` con check
  - helpers de test: `totpCode(secret)`, `ensureTestUser(email, password, fullName?) → userId`, `signInAal1(email, password) → SupabaseClient`, `signInAal2(email, password) → SupabaseClient`, `enrollTotp(client)`, `verifyTotp(client, factorId, secret)`

- [ ] **Step 1: Configurar Auth local** — en `supabase/config.toml`:
  - `[auth]` → `enable_signup = false`
  - `[auth.email]` → `enable_signup = false`
  - `[auth.mfa.totp]` → `enroll_enabled = true` y `verify_enabled = true`

- [ ] **Step 2: Helpers de autenticación para pruebas**

```ts
// tests/rls/auth-helpers.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as OTPAuth from 'otpauth';
import { serviceClient } from './helpers';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

/** Código TOTP vigente a partir del secreto base32 que entrega `mfa.enroll`. */
export function totpCode(secret: string): string {
  return new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret), algorithm: 'SHA1', digits: 6, period: 30,
  }).generate();
}

/** Crea (o recrea) un usuario de prueba con la secret key. Devuelve su id. */
export async function ensureTestUser(email: string, password: string, fullName = 'Prueba'): Promise<string> {
  const admin = serviceClient();
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) await admin.auth.admin.deleteUser(existing.id);
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw error ?? new Error('No se pudo crear el usuario de prueba');
  return data.user.id;
}

export async function signInAal1(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

export async function enrollTotp(client: SupabaseClient): Promise<{ factorId: string; secret: string }> {
  const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'pruebas' });
  if (error || !data) throw error ?? new Error('enroll');
  return { factorId: data.id, secret: data.totp.secret };
}

export async function verifyTotp(client: SupabaseClient, factorId: string, secret: string): Promise<void> {
  const { data: challenge, error: e1 } = await client.auth.mfa.challenge({ factorId });
  if (e1 || !challenge) throw e1 ?? new Error('challenge');
  const { error: e2 } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code: totpCode(secret) });
  if (e2) throw e2;
}

/** Sesión con TOTP verificado (JWT aal2): lo mínimo que exige el panel. */
export async function signInAal2(email: string, password: string): Promise<SupabaseClient> {
  const client = await signInAal1(email, password);
  const { factorId, secret } = await enrollTotp(client);
  await verifyTotp(client, factorId, secret);
  return client;
}
```

- [ ] **Step 3: Pruebas de RLS (fallan)**

```ts
// tests/rls/admin.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { anonClient, serviceClient, stackUp } from './helpers';
import { ensureTestUser, signInAal1, signInAal2 } from './auth-helpers';

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

const EMAIL = 'admin-rls@test.local';
const PASSWORD = 'Prueba-segura-2026';

describe.runIf(up)('RLS: acceso al panel', () => {
  let userId: string;
  let aal1: SupabaseClient;
  let aal2: SupabaseClient;
  let leadId: string;

  beforeAll(async () => {
    userId = await ensureTestUser(EMAIL, PASSWORD, 'Admin Pruebas');
    aal1 = await signInAal1(EMAIL, PASSWORD);
    aal2 = await signInAal2(EMAIL, PASSWORD);
    const { data, error } = await serviceClient().from('leads').insert({
      name: 'Lead RLS', email: 'l@t.co', phone: '6000-0002', service: 'pintura', message: 'seed de pruebas',
    }).select('id').single();
    if (error) throw error;
    leadId = data.id;
  });

  it('el trigger crea el perfil admin al crear el usuario', async () => {
    const { data } = await serviceClient().from('profiles').select('role, full_name').eq('user_id', userId).single();
    expect(data).toEqual({ role: 'admin', full_name: 'Admin Pruebas' });
  });

  it('anónimo no lee profiles ni audit_log', async () => {
    const p = await anonClient().from('profiles').select('user_id');
    const a = await anonClient().from('audit_log').select('id');
    expect(p.data ?? []).toHaveLength(0);
    expect(a.data ?? []).toHaveLength(0);
  });

  it('anónimo no puede fabricar leads "ganados": el trigger los normaliza', async () => {
    const { error } = await anonClient().from('leads').insert({
      name: 'Anon Trampa', email: 'a@t.co', phone: '6000-0003', service: 'pisos', message: 'intento',
      status: 'ganado', source: 'agent', notes: 'notas falsas',
    });
    expect(error).toBeNull();
    const { data } = await serviceClient().from('leads')
      .select('status, source, notes, created_by').eq('name', 'Anon Trampa').single();
    expect(data).toEqual({ status: 'nuevo', source: 'form', notes: null, created_by: null });
  });

  it('con solo contraseña (aal1) no se lee ni actualiza ningún lead', async () => {
    const read = await aal1.from('leads').select('id');
    expect(read.data ?? []).toHaveLength(0);
    const upd = await aal1.from('leads').update({ status: 'contactado' }).eq('id', leadId).select();
    expect(upd.data ?? []).toHaveLength(0);
  });

  it('con TOTP verificado (aal2) se leen y actualizan leads', async () => {
    const read = await aal2.from('leads').select('id').eq('id', leadId);
    expect(read.data).toHaveLength(1);
    const upd = await aal2.from('leads').update({ status: 'contactado', notes: 'llamado' }).eq('id', leadId).select('status, updated_at');
    expect(upd.data?.[0]?.status).toBe('contactado');
  });

  it('actualizar un lead deja rastro en audit_log con before/after', async () => {
    const { data } = await serviceClient().from('audit_log')
      .select('action, user_id, before, after').eq('table_name', 'leads').eq('record_id', leadId)
      .order('created_at', { ascending: false }).limit(1).single();
    expect(data?.action).toBe('update');
    expect(data?.user_id).toBe(userId);
    expect((data?.before as { status: string }).status).toBe('nuevo');
    expect((data?.after as { status: string }).status).toBe('contactado');
  });

  it('un admin crea un lead a mano y queda con created_by', async () => {
    const { data, error } = await aal2.from('leads').insert({
      name: 'Manual', email: '', phone: '6000-0004', service: 'Otro: jardín', message: 'llamó',
      source: 'call', status: 'contactado',
    }).select('created_by, source, status, email').single();
    expect(error).toBeNull();
    expect(data).toEqual({ created_by: userId, source: 'call', status: 'contactado', email: '' });
  });

  it('aal2 lee audit_log; aal1 no', async () => {
    const ok = await aal2.from('audit_log').select('id').limit(1);
    expect(ok.error).toBeNull();
    const no = await aal1.from('audit_log').select('id').limit(1);
    expect(no.data ?? []).toHaveLength(0);
  });
});
```

Run: `npx supabase stop && npx supabase start && npx vitest run tests/rls/admin.test.ts`
Expected: FAIL — `relation "profiles" does not exist` (y/o el enroll TOTP falla si el config no se aplicó: revisar Step 1).

- [ ] **Step 4: Migración**

```sql
-- 0004_admin_access.sql — acceso al panel: perfiles, auditoría, políticas admin (aal2)

-- ── Esquema privado para funciones con privilegios ────────────────────────
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role, supabase_auth_admin;

-- ── profiles ──────────────────────────────────────────────────────────────
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

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ── is_admin(): perfil admin Y segundo factor verificado ──────────────────
create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.role = 'admin'
  ) and coalesce((select auth.jwt()) ->> 'aal', 'aal1') = 'aal2';
$$;

-- ── audit_log ─────────────────────────────────────────────────────────────
create table audit_log (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users (id) on delete set null,
  table_name text not null,
  record_id  text not null,
  action     text not null,   -- insert | update | delete | login.ok | login.failed | login.blocked
  before     jsonb,
  after      jsonb,
  ip_hash    text,
  created_at timestamptz not null default now()
);
alter table audit_log enable row level security;
create policy "admin reads audit" on audit_log for select to authenticated
  using ((select public.is_admin()));
-- sin insert/update/delete desde clientes: escriben los triggers y el hook
create index audit_log_record_idx on audit_log (table_name, record_id, created_at desc);
create index audit_log_created_idx on audit_log (created_at desc);
create index audit_log_user_action_idx on audit_log (user_id, action, created_at desc);

create or replace function private.audit_row() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (user_id, table_name, record_id, action, before, after)
  values (
    (select auth.uid()),
    tg_table_name,
    coalesce(new.id::text, old.id::text),
    lower(tg_op),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

-- ── leads: columnas, blindaje del alta pública, políticas admin ──────────
alter table leads
  alter column email set default '',
  add column notified_at  timestamptz,
  add column notify_error text,
  add column created_by   uuid references auth.users (id) on delete set null,
  add column updated_at   timestamptz not null default now(),
  add constraint leads_source_check check (source in ('form', 'whatsapp', 'call', 'agent'));
create index leads_created_idx on leads (created_at desc);
create index leads_status_idx  on leads (status);

create or replace function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger set_updated_at before update on leads
  for each row execute function private.set_updated_at();

-- Un anónimo (formulario público vía REST) no elige estado, origen ni notas.
create or replace function private.guard_public_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  jwt_role text := coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb ->> 'role';
begin
  if jwt_role = 'anon' then
    new.source := 'form';
    new.status := 'nuevo';
    new.notes := null;
    new.created_by := null;
  elsif jwt_role = 'authenticated' then
    new.created_by := (select auth.uid());
  end if;
  return new;
end $$;
create trigger guard_public_lead before insert on leads
  for each row execute function private.guard_public_lead();

create trigger audit_leads after insert or update or delete on leads
  for each row execute function private.audit_row();

create policy "admin reads leads"   on leads for select to authenticated using ((select public.is_admin()));
create policy "admin inserts leads" on leads for insert to authenticated with check ((select public.is_admin()));
create policy "admin updates leads" on leads for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin deletes leads" on leads for delete to authenticated using ((select public.is_admin()));
-- "public insert leads" (0003) se mantiene: el formulario público sigue insertando.
```

- [ ] **Step 5: Aplicar y verificar**

Run: `npx supabase db reset && npx vitest run tests/rls`
Expected: PASS — `admin.test.ts` 8/8 y las suites de la Fase 1 siguen en verde (la policy pública de insert no cambió; `email` con default no rompe los inserts existentes).

- [ ] **Step 6: Commit**

```bash
git add supabase tests/rls && git commit -m "feat: admin access schema — profiles, audit_log, is_admin() with aal2, lead guards"
```

---

### Task 4: Hook de verificación de contraseña (bloqueo) — `0005_password_hook.sql`

**Files:**
- Create: `supabase/migrations/0005_password_hook.sql`
- Modify: `supabase/config.toml` (`[auth.hook.password_verification_attempt]`)
- Create: `tests/rls/hook.test.ts`

**Interfaces:**
- Produces: `public.hook_password_verification_attempt(event jsonb) returns jsonb` — registra `login.ok` / `login.failed` / `login.blocked` en `audit_log`; con 5 `login.failed` en los últimos 15 min responde `{"decision":"reject","message":"Demasiados intentos. Espere 15 minutos.","should_logout_user":false}`; si no, `{"decision":"continue"}`.

- [ ] **Step 1: Pruebas (fallan)**

```ts
// tests/rls/hook.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { serviceClient, stackUp } from './helpers';
import { ensureTestUser } from './auth-helpers';

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

async function attempt(userId: string, valid: boolean) {
  const { data, error } = await serviceClient()
    .rpc('hook_password_verification_attempt', { event: { user_id: userId, valid } });
  if (error) throw error;
  return data as { decision: string; message?: string };
}

describe.runIf(up)('hook de contraseña: bloqueo tras 5 fallos', () => {
  let userId: string;
  beforeAll(async () => { userId = await ensureTestUser('hook@test.local', 'Prueba-segura-2026'); });

  it('deja pasar los primeros 5 fallos y bloquea el sexto intento', async () => {
    for (let i = 0; i < 5; i++) expect((await attempt(userId, false)).decision).toBe('continue');
    const sixth = await attempt(userId, false);
    expect(sixth.decision).toBe('reject');
    expect(sixth.message).toBe('Demasiados intentos. Espere 15 minutos.');
  });

  it('bloqueado, ni la contraseña correcta entra', async () => {
    expect((await attempt(userId, true)).decision).toBe('reject');
  });

  it('registra los intentos en audit_log', async () => {
    const { data } = await serviceClient().from('audit_log').select('action').eq('user_id', userId);
    const actions = (data ?? []).map((r) => r.action);
    expect(actions.filter((a) => a === 'login.failed')).toHaveLength(5);
    expect(actions.filter((a) => a === 'login.blocked').length).toBeGreaterThanOrEqual(2);
  });

  it('pasados 15 minutos vuelve a dejar pasar', async () => {
    const past = new Date(Date.now() - 16 * 60_000).toISOString();
    await serviceClient().from('audit_log').update({ created_at: past }).eq('user_id', userId);
    expect((await attempt(userId, true)).decision).toBe('continue');
  });
});
```

Run: `npx vitest run tests/rls/hook.test.ts` → FAIL (función no existe)

- [ ] **Step 2: Migración**

```sql
-- 0005_password_hook.sql — Auth Hook "password verification attempt"
create or replace function public.hook_password_verification_attempt(event jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user   uuid    := (event ->> 'user_id')::uuid;
  v_valid  boolean := coalesce((event ->> 'valid')::boolean, false);
  v_failed int;
begin
  select count(*) into v_failed from public.audit_log
   where user_id = v_user and action = 'login.failed'
     and created_at > now() - interval '15 minutes';

  if v_failed >= 5 then
    insert into public.audit_log (user_id, table_name, record_id, action)
    values (v_user, 'auth', v_user::text, 'login.blocked');
    return jsonb_build_object(
      'decision', 'reject',
      'message', 'Demasiados intentos. Espere 15 minutos.',
      'should_logout_user', false
    );
  end if;

  insert into public.audit_log (user_id, table_name, record_id, action)
  values (v_user, 'auth', v_user::text, case when v_valid then 'login.ok' else 'login.failed' end);
  return jsonb_build_object('decision', 'continue');
end $$;

-- Lo invoca Supabase Auth; las pruebas lo llaman con la secret key. Nadie más.
revoke execute on function public.hook_password_verification_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.hook_password_verification_attempt(jsonb) to supabase_auth_admin, service_role;
grant usage on schema public to supabase_auth_admin;
grant insert, select on table public.audit_log to supabase_auth_admin;
```

- [ ] **Step 3: Activar el hook en local** — en `supabase/config.toml`, agregar (junto a los hooks comentados):

```toml
[auth.hook.password_verification_attempt]
enabled = true
uri = "pg-functions://postgres/public/hook_password_verification_attempt"
```

- [ ] **Step 4: Aplicar y verificar**

Run: `npx supabase stop && npx supabase start && npx supabase db reset && npx vitest run tests/rls`
Expected: PASS (hook 4/4; el resto sigue verde).

Comprobación de extremo a extremo del hook: con `signInAal1('hook@test.local', 'clave-mala')` cinco veces (cada una lanza) y una sexta con la contraseña correcta, el error devuelto por Supabase contiene "Demasiados intentos". Agregarlo como quinto `it` en `hook.test.ts` (usar un usuario nuevo `hook-e2e@test.local`).

- [ ] **Step 5: Commit**

```bash
git add supabase tests/rls && git commit -m "feat: password verification hook — audit logins, lock after 5 failures"
```

---

### Task 5: Tipos generados de la base

**Files:**
- Modify: `package.json` (script `db:types`)
- Create: `lib/supabase/database.types.ts` (generado)
- Modify: `lib/supabase/admin.ts` (cliente tipado), `.github/workflows/ci.yml` (job `rls`)

**Interfaces:**
- Produces: `import type { Database } from '@/lib/supabase/database.types'`; `supabaseAdmin()` devuelve `SupabaseClient<Database>`

- [ ] **Step 1: Script** — en `package.json` scripts: `"db:types": "supabase gen types typescript --local > lib/supabase/database.types.ts"`. Ejecutar `npm run db:types` con el stack arriba y confirmar que el archivo contiene `leads`, `profiles`, `audit_log`.

- [ ] **Step 2: Tipar el cliente admin** — en `lib/supabase/admin.ts`: `import type { Database } from '@/lib/supabase/database.types';` y `createClient<Database>(...)`. El cliente público `server.ts` no se tipa (sus casts de la Fase 1 quedan igual).

- [ ] **Step 3: CI** — en el job `rls` de `ci.yml`, después de `supabase start`: `- run: npm run db:types && git diff --exit-code lib/supabase/database.types.ts` (falla si alguien cambió el esquema sin regenerar).

- [ ] **Step 4: Verificar** — `npx tsc --noEmit && npx vitest run tests/unit/contact-route.test.ts` → verde (el insert del endpoint sigue compilando con el tipo generado: `leads.Insert` acepta `source`, `ip_hash`, `user_agent`).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "chore: generated database types, typed admin client, ci drift check"`

---

### Task 6: Utilidades puras del panel

**Files:**
- Create: `lib/admin/phone.ts`, `lib/admin/whatsapp-reply.ts`, `lib/admin/csv.ts`, `lib/admin/errors.ts`, `lib/validation/lead-manual.ts`
- Test: `tests/unit/admin-utils.test.ts`

**Interfaces:**
- Produces:
  - `normalizePanamaPhone(input: string): string | null` — `'6000-0000' → '+50760000000'`; `'+507 6734-0816' → '+50767340816'`; `'0050760000000' → '+50760000000'`; `'12345' → null`; internacional (≥ 10 dígitos que no empiezan por 507) → `'+' + dígitos`
  - `leadReplyMessage(lead: { name: string; service: string }): string`
  - `leadWhatsAppLink(lead: { name: string; service: string; phone: string }): string | null`
  - `toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string` — BOM `\uFEFF`, CRLF, escapes RFC 4180
  - `friendlyDbError(code?: string): string`
  - `LEAD_STATUSES`, `LeadStatus`, `leadStatusSchema`, `manualLeadSchema`, `ManualLeadInput`

- [ ] **Step 1: Tests (fallan)**

```ts
// tests/unit/admin-utils.test.ts
import { describe, it, expect } from 'vitest';
import { normalizePanamaPhone } from '@/lib/admin/phone';
import { leadReplyMessage, leadWhatsAppLink } from '@/lib/admin/whatsapp-reply';
import { toCsv } from '@/lib/admin/csv';
import { friendlyDbError } from '@/lib/admin/errors';
import { manualLeadSchema, leadStatusSchema } from '@/lib/validation/lead-manual';

describe('normalizePanamaPhone', () => {
  it('agrega +507 a números locales de 7 u 8 dígitos', () => {
    expect(normalizePanamaPhone('6000-0000')).toBe('+50760000000');
    expect(normalizePanamaPhone('263 1234')).toBe('+5072631234');
  });
  it('no duplica el código de país', () => {
    expect(normalizePanamaPhone('+507 6734-0816')).toBe('+50767340816');
    expect(normalizePanamaPhone('0050760000000')).toBe('+50760000000');
  });
  it('acepta internacionales y rechaza basura', () => {
    expect(normalizePanamaPhone('+1 305 555 0100')).toBe('+13055550100');
    expect(normalizePanamaPhone('12345')).toBeNull();
    expect(normalizePanamaPhone('llámame')).toBeNull();
  });
});

describe('respuesta por WhatsApp', () => {
  const lead = { name: 'María Pérez', service: 'Limpieza Especializada', phone: '6000-0000' };
  it('arma el mensaje con nombre y servicio', () => {
    expect(leadReplyMessage(lead)).toBe(
      'Hola María Pérez, le escribimos de Viang Solution por su solicitud de Limpieza Especializada. ¿Le parece si coordinamos una visita?',
    );
  });
  it('genera el enlace wa.me con el número normalizado', () => {
    expect(leadWhatsAppLink(lead)).toMatch(/^https:\/\/wa\.me\/50760000000\?text=Hola%20Mar/);
  });
  it('devuelve null si el teléfono no sirve', () => {
    expect(leadWhatsAppLink({ ...lead, phone: '12' })).toBeNull();
  });
});

describe('toCsv', () => {
  const cols = [{ key: 'name', header: 'Nombre' }, { key: 'msg', header: 'Mensaje' }];
  it('empieza con BOM y encabezados, separa con CRLF', () => {
    const csv = toCsv([{ name: 'Ana', msg: 'hola' }], cols);
    expect(csv.startsWith('\uFEFFNombre,Mensaje\r\n')).toBe(true);
    expect(csv.endsWith('Ana,hola\r\n')).toBe(true);
  });
  it('escapa comas, comillas y saltos de línea', () => {
    const csv = toCsv([{ name: 'Pérez, Ana', msg: 'dijo "hola"\nadiós' }], cols);
    expect(csv).toContain('"Pérez, Ana","dijo ""hola""\nadiós"');
  });
  it('null y undefined se vuelven vacío', () => {
    expect(toCsv([{ name: null, msg: undefined }], cols)).toContain('\r\n,\r\n');
  });
});

describe('friendlyDbError', () => {
  it('traduce códigos conocidos y tiene un genérico', () => {
    expect(friendlyDbError('23505')).toBe('Ya existe un registro igual.');
    expect(friendlyDbError('42501')).toBe('No tiene permiso para esta acción.');
    expect(friendlyDbError('99999')).toBe('No se pudo guardar. Intente de nuevo.');
    expect(friendlyDbError(undefined)).toBe('No se pudo guardar. Intente de nuevo.');
  });
});

describe('manualLeadSchema', () => {
  const valid = { name: 'Juan', phone: '6000-0000', email: '', service: 'Pintura', source: 'call', message: 'llamó', status: 'nuevo' };
  it('acepta email vacío y lo guarda como cadena vacía', () => {
    const r = manualLeadSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.success && r.data.email).toBe('');
  });
  it('rechaza origen form y email inválido', () => {
    expect(manualLeadSchema.safeParse({ ...valid, source: 'form' }).success).toBe(false);
    expect(manualLeadSchema.safeParse({ ...valid, email: 'malo' }).success).toBe(false);
  });
  it('el estado inicial solo puede ser nuevo o contactado', () => {
    expect(manualLeadSchema.safeParse({ ...valid, status: 'ganado' }).success).toBe(false);
    expect(leadStatusSchema.safeParse('ganado').success).toBe(true);
    expect(leadStatusSchema.safeParse('cerrado').success).toBe(false);
  });
});
```

Run: `npx vitest run tests/unit/admin-utils.test.ts` → FAIL

- [ ] **Step 2: Implementar**

```ts
// lib/admin/phone.ts
/** Normaliza a E.164. Panamá: 7 u 8 dígitos locales → +507. */
export function normalizePanamaPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 7 || digits.length === 8) return `+507${digits}`;
  if (digits.startsWith('507') && (digits.length === 10 || digits.length === 11)) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}
```

```ts
// lib/admin/whatsapp-reply.ts
import { waLink } from '@/lib/whatsapp';
import { normalizePanamaPhone } from '@/lib/admin/phone';

export function leadReplyMessage(lead: { name: string; service: string }): string {
  return `Hola ${lead.name}, le escribimos de Viang Solution por su solicitud de ${lead.service}. ¿Le parece si coordinamos una visita?`;
}

export function leadWhatsAppLink(lead: { name: string; service: string; phone: string }): string | null {
  const phone = normalizePanamaPhone(lead.phone);
  return phone ? waLink(phone, leadReplyMessage(lead)) : null;
}
```

```ts
// lib/admin/csv.ts
/** CSV RFC 4180 con BOM para que Excel lo abra en UTF-8. */
export function toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string {
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = v instanceof Date ? v.toISOString() : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => escape(c.header)).join(',')];
  for (const row of rows) lines.push(columns.map((c) => escape(row[c.key])).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}
```

```ts
// lib/admin/errors.ts
const MESSAGES: Record<string, string> = {
  '23505': 'Ya existe un registro igual.',
  '23503': 'El registro relacionado no existe.',
  '23514': 'Un valor no es válido.',
  '42501': 'No tiene permiso para esta acción.',
  'PGRST301': 'Su sesión expiró. Vuelva a entrar.',
};
/** Nunca se muestra el mensaje crudo de Postgres/PostgREST. */
export function friendlyDbError(code?: string): string {
  return (code && MESSAGES[code]) || 'No se pudo guardar. Intente de nuevo.';
}
```

```ts
// lib/validation/lead-manual.ts
import { z } from 'zod';

export const LEAD_STATUSES = ['nuevo', 'contactado', 'cotizado', 'ganado', 'perdido'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const leadStatusSchema = z.enum(LEAD_STATUSES);

export const manualLeadSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto').max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Teléfono inválido'),
  email: z.union([z.literal(''), z.string().trim().email('Email inválido').max(200)]).default(''),
  service: z.string().trim().min(1, 'Indique el servicio').max(100),
  source: z.enum(['whatsapp', 'call'], { message: 'Indique el origen' }),
  message: z.string().trim().min(3, 'Escriba al menos unas palabras').max(2000),
  status: z.enum(['nuevo', 'contactado']).default('nuevo'),
});
export type ManualLeadInput = z.infer<typeof manualLeadSchema>;
```

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/admin-utils.test.ts`
- [ ] **Step 4: Commit** — `git add lib tests/unit/admin-utils.test.ts && git commit -m "feat: admin utilities — phone normalization, whatsapp reply, csv, manual lead schema"`

---

### Task 7: Sesión con cookies, `requireAdmin()` y `proxy.ts` con cabeceras

**Files:**
- Create: `lib/supabase/session.ts`, `lib/supabase/browser.ts`, `lib/admin/session.ts`, `proxy.ts`
- Test: `tests/unit/proxy.test.ts`, `tests/unit/admin-session.test.ts`

**Interfaces:**
- Produces:
  - `supabaseSession(): Promise<SupabaseClient<Database>>` (servidor, cookies)
  - `supabaseBrowser(): SupabaseClient<Database>` (navegador; singleton interno de `@supabase/ssr`)
  - `getAdminSession(): Promise<AdminSession | null>` con `AdminSession = { userId: string; email: string; aal: 'aal1' | 'aal2' }`
  - `requireAdmin(): Promise<AdminSession>` — redirige a `/admin/login` sin sesión y a `/admin/2fa` con `aal1`
  - `proxy(request: NextRequest): Promise<NextResponse>` y `config.matcher`

- [ ] **Step 1: Tests (fallan)**

```ts
// tests/unit/proxy.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const getClaims = vi.fn();
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: { getClaims } }) }));
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');

import { proxy } from '@/proxy';

const req = (path: string) => new NextRequest(`http://localhost:3000${path}`);
const claims = (aal: string) => ({ data: { claims: { sub: 'u1', email: 'a@b.co', aal } }, error: null });

beforeEach(() => getClaims.mockReset());

describe('proxy: cabeceras', () => {
  it('agrega cabeceras de seguridad al sitio público sin consultar la sesión', async () => {
    const res = await proxy(req('/servicios/pintura'));
    expect(res.headers.get('strict-transport-security')).toContain('max-age=63072000');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).toBe("frame-ancestors 'none'");
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(getClaims).not.toHaveBeenCalled();
  });
});

describe('proxy: /admin', () => {
  it('sin sesión → login', async () => {
    getClaims.mockResolvedValue({ data: null, error: null });
    const res = await proxy(req('/admin/leads'));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/admin/login');
  });
  it('sin sesión deja ver el login', async () => {
    getClaims.mockResolvedValue({ data: null, error: null });
    expect((await proxy(req('/admin/login'))).status).toBe(200);
  });
  it('aal1 → 2fa (y deja ver /admin/2fa)', async () => {
    getClaims.mockResolvedValue(claims('aal1'));
    expect(new URL((await proxy(req('/admin'))).headers.get('location')!).pathname).toBe('/admin/2fa');
    expect((await proxy(req('/admin/2fa'))).status).toBe(200);
  });
  it('aal2 entra, y desde login/2fa va a Inicio', async () => {
    getClaims.mockResolvedValue(claims('aal2'));
    const ok = await proxy(req('/admin/leads'));
    expect(ok.status).toBe(200);
    expect(ok.headers.get('x-content-type-options')).toBe('nosniff');
    expect(new URL((await proxy(req('/admin/login'))).headers.get('location')!).pathname).toBe('/admin');
  });
});
```

```ts
// tests/unit/admin-session.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getClaims = vi.fn();
vi.mock('@/lib/supabase/session', () => ({ supabaseSession: async () => ({ auth: { getClaims } }) }));
vi.mock('next/navigation', () => ({ redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } }));
vi.mock('server-only', () => ({}));

import { getAdminSession, requireAdmin } from '@/lib/admin/session';

beforeEach(() => getClaims.mockReset());

describe('requireAdmin', () => {
  it('sin claims redirige a login', async () => {
    getClaims.mockResolvedValue({ data: null, error: null });
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/admin/login');
  });
  it('aal1 redirige a 2fa', async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: 'u1', aal: 'aal1' } }, error: null });
    await expect(requireAdmin()).rejects.toThrow('REDIRECT:/admin/2fa');
  });
  it('aal2 devuelve la sesión', async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: 'u1', email: 'a@b.co', aal: 'aal2' } }, error: null });
    expect(await requireAdmin()).toEqual({ userId: 'u1', email: 'a@b.co', aal: 'aal2' });
    expect(await getAdminSession()).toEqual({ userId: 'u1', email: 'a@b.co', aal: 'aal2' });
  });
});
```

Run: `npx vitest run tests/unit/proxy.test.ts tests/unit/admin-session.test.ts` → FAIL

- [ ] **Step 2: Implementar**

```ts
// lib/supabase/session.ts
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';
import { supabasePublicKey, supabaseUrl } from '@/lib/supabase/env';

/** Cliente con la sesión del usuario (cookies httpOnly). SOLO para el panel:
 *  leer cookies vuelve dinámica la ruta, y el sitio público es estático. */
export async function supabaseSession() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl(), supabasePublicKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component: no puede escribir cookies; el proxy las refresca en cada petición.
        }
      },
    },
  });
}
```

```ts
// lib/supabase/browser.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';
import { supabasePublicKey, supabaseUrl } from '@/lib/supabase/env';

/** Cliente de navegador: solo inscripción/verificación TOTP y cierre de sesión. */
export function supabaseBrowser() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublicKey());
}
```

```ts
// lib/admin/session.ts
import 'server-only';
import { redirect } from 'next/navigation';
import { supabaseSession } from '@/lib/supabase/session';

export interface AdminSession { userId: string; email: string; aal: 'aal1' | 'aal2' }

/** Identidad verificada con getClaims() (firma del JWT). Nunca getSession(). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await supabaseSession();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  const c = data.claims as { sub: string; email?: string; aal?: string };
  return { userId: c.sub, email: c.email ?? '', aal: c.aal === 'aal2' ? 'aal2' : 'aal1' };
}

/** Segunda capa tras el proxy: cada página y acción del panel la llama. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (session.aal !== 'aal2') redirect('/admin/2fa');
  return session;
}
```

```ts
// proxy.ts (raíz del proyecto — convención de Next 16, reemplaza a middleware)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublicKey, supabaseUrl } from '@/lib/supabase/env';

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Solo esta directiva: la CSP completa con nonce es un trabajo aparte.
  'Content-Security-Policy': "frame-ancestors 'none'",
};

function secure(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  return res;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return secure(NextResponse.next({ request }));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl(), supabasePublicKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers?: Record<string, string>) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Cabeceras anti-caché que entrega @supabase/ssr al refrescar el token.
        for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v);
      },
    },
  });

  // getClaims() refresca el token si venció y verifica la firma del JWT.
  const { data } = await supabase.auth.getClaims();
  const aal = (data?.claims as { aal?: string } | undefined)?.aal;
  const isLogin = pathname.startsWith('/admin/login');
  const is2fa = pathname.startsWith('/admin/2fa');

  const redirectTo = (path: string): NextResponse => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = '';
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return secure(r);
  };

  if (!data?.claims) return isLogin ? secure(response) : redirectTo('/admin/login');
  if (aal !== 'aal2') return is2fa ? secure(response) : redirectTo('/admin/2fa');
  if (isLogin || is2fa) return redirectTo('/admin');
  return secure(response);
}

export const config = {
  // Todo salvo estáticos: las cabeceras aplican al sitio entero.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|img/|api/health).*)'],
};
```

Nota: si la versión instalada de `@supabase/ssr` declara `setAll` con un solo parámetro, TypeScript aceptará igual la función de dos (el segundo queda `undefined`).

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/proxy.test.ts tests/unit/admin-session.test.ts && npx tsc --noEmit`

- [ ] **Step 4: Comprobar en el navegador** — `npm run dev`, abrir `http://localhost:3000/admin` → redirige a `/admin/login` (404 por ahora: la página llega en Task 9); `curl -I http://localhost:3000/` muestra las cinco cabeceras.

- [ ] **Step 5: Commit** — `git add proxy.ts lib tests/unit && git commit -m "feat: cookie session clients, requireAdmin, proxy with aal2 gate and security headers"`

---

### Task 8: shadcn/ui y shell del panel

**Files:**
- Create: `components.json`, `components/admin/ui/*` (CLI), `lib/utils.ts` (CLI)
- Modify: `app/globals.css`
- Create: `app/admin/layout.tsx`, `app/admin/error.tsx`, `app/admin/actions.ts`, `app/admin/(panel)/layout.tsx`, `app/admin/(panel)/page.tsx` (provisional), `components/admin/Shell.tsx`, `components/admin/NavBar.tsx`
- Test: `tests/unit/admin-shell.test.tsx`

**Interfaces:**
- Consumes: `requireAdmin()`
- Produces: `<Shell email={string}>{children}</Shell>`; `<NavBar pathname={string} />`; Server Action `signOut(): Promise<void>` (cierra la sesión local y redirige a `/admin/login`)

- [ ] **Step 1: shadcn** — crear `components.json` a mano y agregar componentes:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/admin/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

```bash
npx shadcn@latest add button input label textarea select badge card table dialog sheet sonner --yes
ls components/admin/ui   # button.tsx input.tsx ... sonner.tsx
git diff --stat package.json app/globals.css
```

- [ ] **Step 2: Tokens del panel sin pisar los del sitio** — en `app/globals.css`: conservar `@import "tailwindcss";` y, si el CLI la agregó, `@import "tw-animate-css";` justo debajo. **Borrar** todo lo demás que el CLI haya insertado (`:root {...}`, `.dark {...}`, `@theme inline {...}`, `@custom-variant dark`, `@layer base {...}`) y agregar al final del archivo:

```css
/* ── Tokens del panel (shadcn/ui) ─────────────────────────────
   Solo nombres nuevos: primary y accent siguen siendo los del sitio. */
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #1d6fa5;
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}
.admin * { border-color: var(--border); outline-color: color-mix(in oklab, var(--ring) 50%, transparent); }
```

Los componentes generados usan `accent` para estados hover; en el sitio `accent` es el ámbar de los CTA. Reemplazar en los componentes del panel:

```bash
sed -i '' -E 's/\baccent-foreground\b/foreground/g; s/\baccent\b/muted/g' components/admin/ui/*.tsx
grep -rn "accent" components/admin/ui || echo "sin accent: ok"
```

- [ ] **Step 3: Test del shell (falla)**

```tsx
// tests/unit/admin-shell.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NavBar } from '@/components/admin/NavBar';

describe('NavBar del panel', () => {
  it('muestra Inicio, Leads y Seguridad y marca la sección activa', () => {
    render(<NavBar pathname="/admin/leads/123" />);
    expect(screen.getByRole('link', { name: /inicio/i }).getAttribute('href')).toBe('/admin');
    expect(screen.getByRole('link', { name: /leads/i }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: /seguridad/i }).getAttribute('aria-current')).toBeNull();
  });
});
```

- [ ] **Step 4: Implementar**

```tsx
// components/admin/NavBar.tsx
import Link from 'next/link';
import { Home, Inbox, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'Inicio', icon: Home, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Inbox, exact: false },
  { href: '/admin/seguridad', label: 'Seguridad', icon: ShieldCheck, exact: false },
];

/** Barra inferior en móvil, lateral en escritorio. Recibe pathname por props para ser testeable. */
export function NavBar({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Panel" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card md:static md:w-56 md:border-t-0 md:border-r">
      <ul className="flex md:flex-col">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-5 md:text-sm',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

```tsx
// components/admin/Shell.tsx
'use client';
import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/admin/NavBar';
import { Button } from '@/components/admin/ui/button';
import { signOut } from '@/app/admin/actions';

export function Shell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <NavBar pathname={pathname} />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3">
          <span className="truncate text-sm text-muted-foreground">{email}</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="min-h-11">Salir</Button>
          </form>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
```

```ts
// app/admin/actions.ts
'use server';
import { redirect } from 'next/navigation';
import { supabaseSession } from '@/lib/supabase/session';

export async function signOut(): Promise<void> {
  const supabase = await supabaseSession();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/admin/login');
}
```

```tsx
// app/admin/layout.tsx
import type { Metadata } from 'next';
import { Toaster } from '@/components/admin/ui/sonner';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel Viang' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin min-h-svh bg-muted/40 text-foreground">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}
```

```tsx
// app/admin/(panel)/layout.tsx
import { requireAdmin } from '@/lib/admin/session';
import { Shell } from '@/components/admin/Shell';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <Shell email={session.email}>{children}</Shell>;
}
```

```tsx
// app/admin/(panel)/page.tsx (provisional; Task 10 lo completa)
export default function AdminHome() {
  return <h1 className="text-2xl font-bold">Inicio</h1>;
}
```

```tsx
// app/admin/error.tsx
'use client';
import { Button } from '@/components/admin/ui/button';

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60svh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold">Algo salió mal en el panel</h1>
      <p className="text-muted-foreground">Intente de nuevo; si persiste, vuelva a Inicio.</p>
      <div className="flex gap-3">
        <Button onClick={reset} className="min-h-11">Reintentar</Button>
        <Button asChild variant="outline" className="min-h-11"><a href="/admin">Ir a Inicio</a></Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npx vitest run tests/unit/admin-shell.test.tsx && npx tsc --noEmit && npm run build`
Expected: verde; en el build aparecen `ƒ /admin` (dinámica) y las rutas públicas siguen `○`/`●`.

Run: `grep -rln "components/admin\|lib/admin" "app/(site)" components/sections components/layout components/forms components/ui || echo "sitio limpio"`
Expected: `sitio limpio`.

Run: `npx @lhci/cli@0.14.x autorun` (build ya hecho) → aserciones en verde; luego `git checkout -- .lighthouseci && git clean -fdq .lighthouseci`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: admin shell with shadcn/ui primitives scoped to the panel"`

---

### Task 9: Login y segundo factor

**Files:**
- Create: `app/admin/(auth)/layout.tsx`, `app/admin/(auth)/login/page.tsx`, `app/admin/(auth)/login/LoginForm.tsx`, `app/admin/(auth)/login/actions.ts`, `app/admin/(auth)/2fa/page.tsx`, `app/admin/(auth)/2fa/TotpGate.tsx`
- Test: `tests/unit/login-action.test.ts`

**Interfaces:**
- Consumes: `rateLimit`, `getRequestContext`, `supabaseSession`, `supabaseBrowser`
- Produces: `signIn(prev: ActionState, formData: FormData): Promise<ActionState>` con `ActionState = { ok: boolean; error?: string }`; `sendReset(prev, formData)` (recuperación); componente `<TotpGate />`

- [ ] **Step 1: Test de la acción de login (falla)**

```ts
// tests/unit/login-action.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const signInWithPassword = vi.fn();
vi.mock('@/lib/supabase/session', () => ({ supabaseSession: async () => ({ auth: { signInWithPassword } }) }));
const rateLimitMock = vi.fn(() => true);
vi.mock('@/lib/rate-limit', () => ({ rateLimit: () => rateLimitMock() }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'CF-Connecting-IP': '190.34.1.2' }) }));
vi.mock('next/navigation', () => ({ redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } }));
vi.mock('server-only', () => ({}));

import { signIn } from '@/app/admin/(auth)/login/actions';

const form = (email: string, password: string) => {
  const fd = new FormData(); fd.set('email', email); fd.set('password', password); return fd;
};

beforeEach(() => { signInWithPassword.mockReset(); rateLimitMock.mockReturnValue(true); });

describe('signIn', () => {
  it('con rate limit excedido no toca Supabase', async () => {
    rateLimitMock.mockReturnValue(false);
    expect(await signIn({ ok: false }, form('a@b.co', 'secreta123'))).toEqual({ ok: false, error: 'Demasiados intentos. Espere un minuto.' });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
  it('credenciales malas → mensaje genérico', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials', status: 400 } });
    expect(await signIn({ ok: false }, form('a@b.co', 'secreta123'))).toEqual({ ok: false, error: 'Credenciales inválidas' });
  });
  it('email inválido → mismo mensaje genérico, sin llamar a Supabase', async () => {
    expect(await signIn({ ok: false }, form('no-es-email', 'secreta123'))).toEqual({ ok: false, error: 'Credenciales inválidas' });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
  it('bloqueo del hook → se muestra su mensaje', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Demasiados intentos. Espere 15 minutos.', status: 403 } });
    expect((await signIn({ ok: false }, form('a@b.co', 'secreta123'))).error).toBe('Demasiados intentos. Espere 15 minutos.');
  });
  it('éxito → redirige a 2fa', async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    await expect(signIn({ ok: false }, form('a@b.co', 'secreta123'))).rejects.toThrow('REDIRECT:/admin/2fa');
  });
});
```

- [ ] **Step 2: Implementar**

```ts
// app/admin/(auth)/login/actions.ts
'use server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { rateLimit } from '@/lib/rate-limit';
import { getRequestContext } from '@/lib/request-context';
import { supabaseSession } from '@/lib/supabase/session';

export interface ActionState { ok: boolean; error?: string }

const credentials = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(6).max(200),
});

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ip } = getRequestContext(await headers());
  if (!rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 })) {
    return { ok: false, error: 'Demasiados intentos. Espere un minuto.' };
  }
  const parsed = credentials.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { ok: false, error: 'Credenciales inválidas' };

  const supabase = await supabaseSession();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // El hook de bloqueo devuelve su propio texto; cualquier otro error es genérico a propósito.
    const blocked = error.message.startsWith('Demasiados intentos');
    return { ok: false, error: blocked ? error.message : 'Credenciales inválidas' };
  }
  redirect('/admin/2fa');
}

export async function sendReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = z.string().trim().email().safeParse(formData.get('email'));
  if (!email.success) return { ok: false, error: 'Escriba un email válido' };
  const supabase = await supabaseSession();
  const origin = (await headers()).get('origin') ?? 'https://viangsolution.com';
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${origin}/admin/seguridad` });
  // Siempre la misma respuesta: no revela si el email existe.
  return { ok: true };
}
```

```tsx
// app/admin/(auth)/layout.tsx
import Image from 'next/image';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
        <Image src="/img/logo.png" alt="Viang Solution" width={160} height={50} className="mx-auto mb-6 h-10 w-auto" />
        {children}
      </div>
    </main>
  );
}
```

```tsx
// app/admin/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';
export const metadata: Metadata = { title: 'Entrar' };
export default function LoginPage() {
  return (
    <>
      <h1 className="mb-4 text-center text-xl font-bold">Panel administrativo</h1>
      <LoginForm />
    </>
  );
}
```

```tsx
// app/admin/(auth)/login/LoginForm.tsx
'use client';
import { useActionState, useState } from 'react';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { sendReset, signIn, type ActionState } from './actions';

const initial: ActionState = { ok: false };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial);
  const [reset, resetAction, resetPending] = useActionState(sendReset, initial);
  const [showReset, setShowReset] = useState(false);

  if (showReset) {
    return (
      <form action={resetAction} className="space-y-4">
        <Label htmlFor="email">Su email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {reset.ok
          ? <p role="status" className="text-sm text-muted-foreground">Si el email existe, le enviamos un enlace para cambiar la contraseña.</p>
          : reset.error && <p role="alert" className="text-sm text-destructive">{reset.error}</p>}
        <Button type="submit" className="min-h-11 w-full" disabled={resetPending}>Enviar enlace</Button>
        <button type="button" onClick={() => setShowReset(false)} className="min-h-11 w-full text-sm text-muted-foreground underline">Volver</button>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" aria-invalid={!!state.error} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" aria-invalid={!!state.error} />
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="min-h-11 w-full" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</Button>
      <button type="button" onClick={() => setShowReset(true)} className="min-h-11 w-full text-sm text-muted-foreground underline">Olvidé mi contraseña</button>
    </form>
  );
}
```

```tsx
// app/admin/(auth)/2fa/page.tsx
import type { Metadata } from 'next';
import { TotpGate } from './TotpGate';
export const metadata: Metadata = { title: 'Verificación' };
export default function TwoFactorPage() {
  return <TotpGate />;
}
```

```tsx
// app/admin/(auth)/2fa/TotpGate.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';

type Mode = { kind: 'loading' } | { kind: 'verify'; factorId: string } | { kind: 'enroll'; factorId: string; qr: string; secret: string };

/** Inscribe (primer acceso) o verifica el TOTP. Sin este paso no hay JWT aal2. */
export function TotpGate() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>({ kind: 'loading' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp.find((f) => f.status === 'verified');
      if (verified) return setMode({ kind: 'verify', factorId: verified.id });
      const { data: enrolled, error: e } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Panel Viang' });
      if (e || !enrolled) return setError('No se pudo iniciar la configuración. Recargue la página.');
      setMode({ kind: 'enroll', factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret });
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode.kind === 'loading') return;
    setBusy(true); setError('');
    const supabase = supabaseBrowser();
    const { data: challenge, error: e1 } = await supabase.auth.mfa.challenge({ factorId: mode.factorId });
    if (e1 || !challenge) { setBusy(false); return setError('No se pudo verificar. Intente de nuevo.'); }
    const { error: e2 } = await supabase.auth.mfa.verify({ factorId: mode.factorId, challengeId: challenge.id, code: code.trim() });
    if (e2) { setBusy(false); return setError('Código incorrecto o vencido.'); }
    router.refresh();
    router.replace('/admin');
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="text-center text-xl font-bold">
        {mode.kind === 'enroll' ? 'Configure su segundo factor' : 'Código de verificación'}
      </h1>
      {mode.kind === 'enroll' && (
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>Escanee el código con Google Authenticator, 1Password o similar.</p>
          {/* qr_code llega como data URI SVG desde Supabase */}
          <img src={mode.qr} alt="Código QR para la app de autenticación" className="mx-auto h-44 w-44" />
          <p>Si no puede escanear, ingrese esta clave: <code className="break-all">{mode.secret}</code></p>
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="code">Código de 6 dígitos</Label>
        <Input id="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" required
          value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!error} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="min-h-11 w-full" disabled={busy || mode.kind === 'loading'}>
        {busy ? 'Verificando…' : 'Verificar'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/login-action.test.ts && npx tsc --noEmit`

- [ ] **Step 4: Probar a mano** — con el stack local: `node scripts/create-admin.mjs` no existe aún (Task 16); crear un usuario desde Studio (`http://127.0.0.1:54323` → Authentication → Add user, con "Auto confirm"). `npm run dev` con `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon de .env.test>`: login → QR → código → llega a Inicio. Cerrar sesión → volver a entrar pide solo el código.

- [ ] **Step 5: Commit** — `git add app tests/unit/login-action.test.ts && git commit -m "feat: admin login with rate limit and mandatory TOTP enrollment/verification"`

---

### Task 10: Consultas de leads e Inicio

**Files:**
- Create: `lib/admin/leads.ts`
- Modify: `app/admin/(panel)/page.tsx`
- Test: `tests/unit/admin-leads.test.ts` (contra el stack local, saltada si está apagado)

**Interfaces:**
- Produces (todas reciben el cliente por parámetro para ser testeables con la sesión `aal2` de las pruebas):
  - `type Db = SupabaseClient<Database>`; `type LeadRow = Database['public']['Tables']['leads']['Row']`; `type AuditRow = Database['public']['Tables']['audit_log']['Row']`
  - `PAGE_SIZE = 25`
  - `listLeads(db, { status?, q?, page? }): Promise<{ leads: LeadRow[]; total: number; page: number; pages: number }>`
  - `listAllLeads(db, { status?, q? }): Promise<LeadRow[]>` — tope 10 000
  - `getLead(db, id): Promise<LeadRow | null>`
  - `getLeadCounts(db): Promise<{ nuevos: number; semana: number; pendientes: number }>`
  - `getLatestLeads(db, n): Promise<LeadRow[]>`
  - `getLeadHistory(db, id): Promise<AuditRow[]>` — últimas 20

- [ ] **Step 1: Test (falla)**

```ts
// tests/unit/admin-leads.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { serviceClient, stackUp } from '../rls/helpers';
import { ensureTestUser, signInAal2 } from '../rls/auth-helpers';
import { getLead, getLeadCounts, listLeads, listAllLeads } from '@/lib/admin/leads';
import type { Database } from '@/lib/supabase/database.types';

const up = await stackUp();
if (!up) console.warn('⚠ Supabase local apagado — suite saltada (en CI corre siempre)');

describe.runIf(up)('consultas de leads', () => {
  let db: SupabaseClient<Database>;
  beforeAll(async () => {
    await ensureTestUser('queries@test.local', 'Prueba-segura-2026');
    db = (await signInAal2('queries@test.local', 'Prueba-segura-2026')) as SupabaseClient<Database>;
    await serviceClient().from('leads').delete().like('name', 'Q-%');
    await serviceClient().from('leads').insert([
      { name: 'Q-Ana', email: 'q1@t.co', phone: '6000-1001', service: 'pintura', message: 'x', status: 'nuevo' },
      { name: 'Q-Beto', email: 'q2@t.co', phone: '6000-1002', service: 'pisos', message: 'x', status: 'contactado' },
      { name: 'Q-Carla', email: 'q3@t.co', phone: '6000-1003', service: 'pisos', message: 'x', status: 'nuevo', notify_error: 'smtp' },
    ]);
  });

  it('filtra por estado y busca por nombre, teléfono o email', async () => {
    expect((await listLeads(db, { status: 'contactado', q: 'Q-' })).leads.map((l) => l.name)).toEqual(['Q-Beto']);
    expect((await listLeads(db, { q: '6000-1003' })).leads[0]?.name).toBe('Q-Carla');
    expect((await listLeads(db, { q: 'q2@t.co' })).leads[0]?.name).toBe('Q-Beto');
  });

  it('pagina en el servidor', async () => {
    const r = await listLeads(db, { q: 'Q-', page: 1 });
    expect(r.total).toBe(3);
    expect(r.pages).toBe(1);
  });

  it('ignora caracteres que romperían el filtro', async () => {
    const r = await listLeads(db, { q: 'Q-,(x)' });
    expect(r.leads).toEqual([]);
  });

  it('cuenta nuevos, últimos 7 días y notificaciones pendientes', async () => {
    const c = await getLeadCounts(db);
    expect(c.nuevos).toBeGreaterThanOrEqual(2);
    expect(c.semana).toBeGreaterThanOrEqual(3);
    expect(c.pendientes).toBeGreaterThanOrEqual(1);
  });

  it('getLead devuelve null si no existe y listAllLeads respeta el filtro', async () => {
    expect(await getLead(db, '00000000-0000-0000-0000-000000000000')).toBeNull();
    expect((await listAllLeads(db, { status: 'contactado', q: 'Q-' })).map((l) => l.name)).toEqual(['Q-Beto']);
  });
});
```

- [ ] **Step 2: Implementar**

```ts
// lib/admin/leads.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { LeadStatus } from '@/lib/validation/lead-manual';

export type Db = SupabaseClient<Database>;
export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type AuditRow = Database['public']['Tables']['audit_log']['Row'];

export const PAGE_SIZE = 25;
const EXPORT_CAP = 10_000;

export interface LeadFilters { status?: LeadStatus; q?: string; page?: number }

/** Quita lo que PostgREST interpreta en un filtro `or(...)`. */
function cleanQuery(q: string): string {
  return q.replace(/[,()"'\\%]/g, '').trim();
}

function applyFilters(db: Db, f: LeadFilters) {
  let query = db.from('leads').select('*', { count: 'exact' });
  if (f.status) query = query.eq('status', f.status);
  const q = f.q ? cleanQuery(f.q) : '';
  if (q) query = query.or(`name.ilike.*${q}*,email.ilike.*${q}*,phone.ilike.*${q}*`);
  return query.order('created_at', { ascending: false });
}

export async function listLeads(db: Db, f: LeadFilters) {
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await applyFilters(db, f).range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(`No se pudieron listar los leads: ${error.code}`);
  const total = count ?? 0;
  return { leads: data ?? [], total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listAllLeads(db: Db, f: Omit<LeadFilters, 'page'>): Promise<LeadRow[]> {
  const { data, error } = await applyFilters(db, f).limit(EXPORT_CAP);
  if (error) throw new Error(`No se pudieron exportar los leads: ${error.code}`);
  return data ?? [];
}

export async function getLead(db: Db, id: string): Promise<LeadRow | null> {
  const { data, error } = await db.from('leads').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`No se pudo leer el lead: ${error.code}`);
  return data;
}

export async function getLeadCounts(db: Db) {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [nuevos, semana, pendientes] = await Promise.all([
    db.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'nuevo'),
    db.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('leads').select('id', { count: 'exact', head: true }).not('notify_error', 'is', null).is('notified_at', null),
  ]);
  return { nuevos: nuevos.count ?? 0, semana: semana.count ?? 0, pendientes: pendientes.count ?? 0 };
}

export async function getLatestLeads(db: Db, n: number): Promise<LeadRow[]> {
  const { data } = await db.from('leads').select('*').order('created_at', { ascending: false }).limit(n);
  return data ?? [];
}

export async function getLeadHistory(db: Db, id: string): Promise<AuditRow[]> {
  const { data } = await db.from('audit_log').select('*')
    .eq('table_name', 'leads').eq('record_id', id)
    .order('created_at', { ascending: false }).limit(20);
  return data ?? [];
}
```

Inicio (`app/admin/(panel)/page.tsx`): `requireAdmin()` → `const db = await supabaseSession()` → `Promise.all([getLeadCounts(db), getLatestLeads(db, 5)])` → tres `<Card>` con las cifras ("Nuevos", "Últimos 7 días", "Notificaciones pendientes") y una lista de los 5 últimos como `<LeadCard>` (Task 11 lo crea; hasta entonces, `<Link href={`/admin/leads/${l.id}`}>` con nombre, servicio y fecha).

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/admin-leads.test.ts && npx tsc --noEmit`
- [ ] **Step 4: Commit** — `git add lib app tests/unit/admin-leads.test.ts && git commit -m "feat: lead queries with server-side filters and pagination; admin home counters"`

---

### Task 11: Lista de leads y exportación CSV

**Files:**
- Create: `components/admin/StatusBadge.tsx`, `components/admin/LeadCard.tsx`, `components/admin/LeadTable.tsx`, `app/admin/(panel)/leads/LeadFilters.tsx`, `app/admin/(panel)/leads/page.tsx`, `app/admin/(panel)/leads/export/route.ts`
- Test: `tests/unit/lead-table.test.tsx`, `tests/unit/leads-export.test.ts`

**Interfaces:**
- Consumes: `listLeads`, `listAllLeads`, `toCsv`, `requireAdmin`, `supabaseSession`, `LEAD_STATUSES`
- Produces: `<StatusBadge status={LeadStatus} />`; `<LeadCard lead={LeadRow} />`; `<LeadTable leads={LeadRow[]} />` (tabla en `md:`, tarjetas debajo); `GET /admin/leads/export?estado=&q=` → `text/csv`

- [ ] **Step 1: Tests (fallan)**

```tsx
// tests/unit/lead-table.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LeadTable } from '@/components/admin/LeadTable';
import type { LeadRow } from '@/lib/admin/leads';

const lead = (over: Partial<LeadRow>): LeadRow => ({
  id: 'L1', name: 'Ana', email: 'a@t.co', phone: '6000-0000', service: 'pintura', message: 'hola',
  source: 'form', status: 'nuevo', notes: null, utm_source: null, utm_medium: null, utm_campaign: null,
  ip_hash: null, user_agent: null, created_at: new Date().toISOString(), notified_at: null,
  notify_error: null, created_by: null, updated_at: new Date().toISOString(), ...over,
});

describe('LeadTable', () => {
  it('enlaza cada lead a su detalle y marca notificaciones pendientes', () => {
    render(<LeadTable leads={[lead({}), lead({ id: 'L2', name: 'Beto', notify_error: 'smtp' })]} />);
    expect(screen.getAllByRole('link', { name: /ana/i })[0].getAttribute('href')).toBe('/admin/leads/L1');
    expect(screen.getAllByText(/notificación pendiente/i).length).toBeGreaterThan(0);
  });
  it('sin leads muestra un estado vacío', () => {
    render(<LeadTable leads={[]} />);
    expect(screen.getByText(/no hay leads/i)).toBeTruthy();
  });
});
```

```ts
// tests/unit/leads-export.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/admin/session', () => ({ requireAdmin: async () => ({ userId: 'u1', email: 'a@b.co', aal: 'aal2' }) }));
vi.mock('@/lib/supabase/session', () => ({ supabaseSession: async () => ({}) }));
vi.mock('@/lib/admin/leads', () => ({
  listAllLeads: async () => [{
    created_at: '2026-08-27T10:00:00Z', name: 'Ana, la de "Pérez"', phone: '6000-0000', email: 'a@t.co',
    service: 'pintura', source: 'form', status: 'nuevo', message: 'hola', notes: null,
    utm_source: null, utm_medium: null, utm_campaign: null,
  }],
}));
vi.mock('server-only', () => ({}));

import { GET } from '@/app/admin/(panel)/leads/export/route';

describe('GET /admin/leads/export', () => {
  it('devuelve CSV con BOM, encabezados y escapes', async () => {
    const res = await GET(new Request('http://localhost/admin/leads/export?estado=nuevo'));
    expect(res.headers.get('content-type')).toContain('text/csv');
    expect(res.headers.get('content-disposition')).toMatch(/leads-\d{4}-\d{2}-\d{2}\.csv/);
    const body = await res.text();
    expect(body.startsWith('\uFEFFFecha,Nombre,')).toBe(true);
    expect(body).toContain('"Ana, la de ""Pérez"""');
  });
});
```

- [ ] **Step 2: Implementar**

```tsx
// components/admin/StatusBadge.tsx
import { Badge } from '@/components/admin/ui/badge';
import type { LeadStatus } from '@/lib/validation/lead-manual';

const STYLES: Record<LeadStatus, string> = {
  nuevo: 'bg-blue-100 text-blue-900',
  contactado: 'bg-amber-100 text-amber-900',
  cotizado: 'bg-violet-100 text-violet-900',
  ganado: 'bg-green-100 text-green-900',
  perdido: 'bg-slate-200 text-slate-800',
};
const LABELS: Record<LeadStatus, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', cotizado: 'Cotizado', ganado: 'Ganado', perdido: 'Perdido',
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status in STYLES ? status : 'nuevo') as LeadStatus;
  return <Badge className={`${STYLES[s]} border-0`}>{LABELS[s]}</Badge>;
}
```

```tsx
// components/admin/LeadCard.tsx
import Link from 'next/link';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { LeadRow } from '@/lib/admin/leads';

export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'hace minutos';
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

export function LeadCard({ lead }: { lead: LeadRow }) {
  const pending = lead.notify_error && !lead.notified_at;
  return (
    <Link href={`/admin/leads/${lead.id}`} className="block rounded-xl border bg-card p-4 shadow-sm hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{lead.name}</p>
          <p className="truncate text-sm text-muted-foreground">{lead.service} · {lead.source}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{relativeDate(lead.created_at)}</p>
      {pending && <p className="mt-1 text-xs font-medium text-destructive">Notificación pendiente</p>}
    </Link>
  );
}
```

```tsx
// components/admin/LeadTable.tsx
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';
import { LeadCard, relativeDate } from '@/components/admin/LeadCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { LeadRow } from '@/lib/admin/leads';

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) return <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No hay leads con ese filtro.</p>;
  return (
    <>
      <div className="space-y-3 md:hidden">{leads.map((l) => <LeadCard key={l.id} lead={l} />)}</div>
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead><TableHead>Servicio</TableHead><TableHead>Origen</TableHead>
              <TableHead>Estado</TableHead><TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <Link href={`/admin/leads/${l.id}`} className="font-medium underline-offset-2 hover:underline">{l.name}</Link>
                  {l.notify_error && !l.notified_at && <span className="ml-2 text-xs text-destructive">Notificación pendiente</span>}
                </TableCell>
                <TableCell>{l.service}</TableCell>
                <TableCell>{l.source}</TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
                <TableCell className="text-muted-foreground">{relativeDate(l.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
```

```tsx
// app/admin/(panel)/leads/LeadFilters.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/admin/ui/input';
import { LEAD_STATUSES } from '@/lib/validation/lead-manual';

/** Filtros en la URL (?estado=&q=) para que el CSV y la paginación los compartan. */
export function LeadFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('pagina');
    router.replace(`/admin/leads?${next.toString()}`);
  };
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input type="search" placeholder="Buscar por nombre, teléfono o email" aria-label="Buscar"
        defaultValue={params.get('q') ?? ''} onChange={(e) => set('q', e.target.value)} className="min-h-11" />
      <select aria-label="Estado" className="min-h-11 rounded-md border bg-card px-3"
        defaultValue={params.get('estado') ?? ''} onChange={(e) => set('estado', e.target.value)}>
        <option value="">Todos los estados</option>
        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
      </select>
    </div>
  );
}
```

```tsx
// app/admin/(panel)/leads/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/admin/ui/button';
import { LeadTable } from '@/components/admin/LeadTable';
import { requireAdmin } from '@/lib/admin/session';
import { supabaseSession } from '@/lib/supabase/session';
import { listLeads } from '@/lib/admin/leads';
import { leadStatusSchema } from '@/lib/validation/lead-manual';
import { LeadFilters } from './LeadFilters';

export const metadata: Metadata = { title: 'Leads' };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = leadStatusSchema.safeParse(sp.estado);
  const filters = { status: status.success ? status.data : undefined, q: sp.q, page: Number(sp.pagina ?? 1) || 1 };
  const db = await supabaseSession();
  const { leads, total, page, pages } = await listLeads(db, filters);
  const qs = new URLSearchParams({ ...(filters.status && { estado: filters.status }), ...(filters.q && { q: filters.q }) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Leads <span className="text-base font-normal text-muted-foreground">({total})</span></h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="min-h-11"><a href={`/admin/leads/export?${qs}`}>Exportar CSV</a></Button>
          <Button asChild className="min-h-11"><Link href="/admin/leads/nuevo">Nuevo lead</Link></Button>
        </div>
      </div>
      <Suspense><LeadFilters /></Suspense>
      <LeadTable leads={leads} />
      {pages > 1 && (
        <nav aria-label="Paginación" className="flex justify-between">
          <Button asChild variant="outline" disabled={page <= 1}><Link href={`/admin/leads?${qs}&pagina=${page - 1}`}>Anterior</Link></Button>
          <span className="self-center text-sm text-muted-foreground">Página {page} de {pages}</span>
          <Button asChild variant="outline" disabled={page >= pages}><Link href={`/admin/leads?${qs}&pagina=${page + 1}`}>Siguiente</Link></Button>
        </nav>
      )}
    </div>
  );
}
```

```ts
// app/admin/(panel)/leads/export/route.ts
import { requireAdmin } from '@/lib/admin/session';
import { supabaseSession } from '@/lib/supabase/session';
import { listAllLeads } from '@/lib/admin/leads';
import { toCsv } from '@/lib/admin/csv';
import { leadStatusSchema } from '@/lib/validation/lead-manual';

const COLUMNS = [
  { key: 'created_at', header: 'Fecha' }, { key: 'name', header: 'Nombre' }, { key: 'phone', header: 'Teléfono' },
  { key: 'email', header: 'Email' }, { key: 'service', header: 'Servicio' }, { key: 'source', header: 'Origen' },
  { key: 'status', header: 'Estado' }, { key: 'message', header: 'Mensaje' }, { key: 'notes', header: 'Notas' },
  { key: 'utm_source', header: 'utm_source' }, { key: 'utm_medium', header: 'utm_medium' }, { key: 'utm_campaign', header: 'utm_campaign' },
];

export async function GET(request: Request): Promise<Response> {
  await requireAdmin();
  const url = new URL(request.url);
  const status = leadStatusSchema.safeParse(url.searchParams.get('estado'));
  const db = await supabaseSession();
  const leads = await listAllLeads(db, { status: status.success ? status.data : undefined, q: url.searchParams.get('q') ?? undefined });
  const csv = toCsv(leads as unknown as Record<string, unknown>[], COLUMNS);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
```

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/lead-table.test.tsx tests/unit/leads-export.test.ts && npx tsc --noEmit`
- [ ] **Step 4: Commit** — `git add app components tests/unit && git commit -m "feat: leads list with filters, pagination and csv export"`

---

### Task 12: Detalle del lead y acciones

**Files:**
- Create: `app/admin/(panel)/leads/actions.ts`, `app/admin/(panel)/leads/[id]/page.tsx`, `app/admin/(panel)/leads/[id]/LeadActions.tsx`, `app/admin/(panel)/leads/[id]/LeadHistory.tsx`
- Test: `tests/unit/lead-actions.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `supabaseSession`, `supabaseAdmin`, `sendLeadNotification`, `getLead`, `getLeadHistory`, `leadStatusSchema`, `friendlyDbError`, `leadWhatsAppLink`, `normalizePanamaPhone`
- Produces (todas `(prev: ActionState, formData: FormData) => Promise<ActionState>` con `ActionState = { ok: boolean; error?: string; message?: string }`): `updateLeadStatus` (campos `id`, `status`), `updateLeadNotes` (`id`, `notes`), `retryNotification` (`id`)

- [ ] **Step 1: Tests (fallan)**

```ts
// tests/unit/lead-actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const update = vi.fn();
const eq = vi.fn();
const selectSingle = vi.fn();
vi.mock('@/lib/admin/session', () => ({ requireAdmin: async () => ({ userId: 'u1', email: 'a@b.co', aal: 'aal2' }) }));
vi.mock('@/lib/supabase/session', () => ({
  supabaseSession: async () => ({
    from: () => ({
      update: (row: unknown) => { update(row); return { eq: (...a: unknown[]) => { eq(...a); return { select: () => ({ single: selectSingle }) }; } }; },
      select: () => ({ eq: () => ({ maybeSingle: selectSingle }) }),
    }),
  }),
}));
const sendMock = vi.fn();
vi.mock('@/lib/mailer', () => ({ sendLeadNotification: (l: unknown) => sendMock(l) }));
const revalidate = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidate(p) }));
vi.mock('server-only', () => ({}));

import { retryNotification, updateLeadNotes, updateLeadStatus } from '@/app/admin/(panel)/leads/actions';

const fd = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f; };
const ID = '11111111-1111-4111-8111-111111111111';

beforeEach(() => { update.mockReset(); eq.mockReset(); selectSingle.mockReset(); sendMock.mockReset(); revalidate.mockReset(); });

describe('acciones del lead', () => {
  it('updateLeadStatus valida el estado y revalida las rutas', async () => {
    selectSingle.mockResolvedValue({ data: { id: ID }, error: null });
    expect(await updateLeadStatus({ ok: false }, fd({ id: ID, status: 'cotizado' }))).toEqual({ ok: true, message: 'Estado actualizado' });
    expect(update).toHaveBeenCalledWith({ status: 'cotizado' });
    expect(revalidate).toHaveBeenCalledWith('/admin/leads');
    expect(revalidate).toHaveBeenCalledWith(`/admin/leads/${ID}`);
  });
  it('rechaza estados inválidos sin tocar la base', async () => {
    expect((await updateLeadStatus({ ok: false }, fd({ id: ID, status: 'cerrado' }))).ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
  it('traduce errores de la base', async () => {
    selectSingle.mockResolvedValue({ data: null, error: { code: '42501' } });
    expect((await updateLeadNotes({ ok: false }, fd({ id: ID, notes: 'x' }))).error).toBe('No tiene permiso para esta acción.');
  });
  it('retryNotification envía el email y marca notified_at', async () => {
    selectSingle
      .mockResolvedValueOnce({ data: { id: ID, name: 'Ana', email: 'a@t.co', phone: '6000', service: 'pintura', message: 'hola' }, error: null })
      .mockResolvedValueOnce({ data: { id: ID }, error: null });
    sendMock.mockResolvedValue(undefined);
    expect(await retryNotification({ ok: false }, fd({ id: ID }))).toEqual({ ok: true, message: 'Notificación enviada' });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ notify_error: null }));
  });
  it('retryNotification guarda el error si el email vuelve a fallar', async () => {
    selectSingle
      .mockResolvedValueOnce({ data: { id: ID, name: 'Ana', email: 'a@t.co', phone: '6000', service: 'pintura', message: 'hola' }, error: null })
      .mockResolvedValueOnce({ data: { id: ID }, error: null });
    sendMock.mockRejectedValue(new Error('smtp caído con /ruta/secreta'));
    const r = await retryNotification({ ok: false }, fd({ id: ID }));
    expect(r.ok).toBe(false);
    expect(r.error).toBe('El email volvió a fallar. El lead sigue guardado.');
    expect(update).toHaveBeenCalledWith({ notify_error: 'smtp caído con /ruta/secreta' });
  });
});
```

- [ ] **Step 2: Implementar**

```ts
// app/admin/(panel)/leads/actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/session';
import { supabaseSession } from '@/lib/supabase/session';
import { sendLeadNotification } from '@/lib/mailer';
import { friendlyDbError } from '@/lib/admin/errors';
import { leadStatusSchema } from '@/lib/validation/lead-manual';

export interface ActionState { ok: boolean; error?: string; message?: string }

const idSchema = z.string().uuid();

function revalidateLead(id: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
}

async function updateLead(id: string, patch: Record<string, unknown>): Promise<string | null> {
  const db = await supabaseSession();
  const { error } = await db.from('leads').update(patch).eq('id', id).select('id').single();
  return error ? friendlyDbError(error.code) : null;
}

export async function updateLeadStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ id: idSchema, status: leadStatusSchema }).safeParse({ id: formData.get('id'), status: formData.get('status') });
  if (!parsed.success) return { ok: false, error: 'Estado inválido' };
  const error = await updateLead(parsed.data.id, { status: parsed.data.status });
  if (error) return { ok: false, error };
  revalidateLead(parsed.data.id);
  return { ok: true, message: 'Estado actualizado' };
}

export async function updateLeadNotes(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ id: idSchema, notes: z.string().max(5000) }).safeParse({ id: formData.get('id'), notes: formData.get('notes') ?? '' });
  if (!parsed.success) return { ok: false, error: 'Notas demasiado largas' };
  const error = await updateLead(parsed.data.id, { notes: parsed.data.notes.trim() || null });
  if (error) return { ok: false, error };
  revalidateLead(parsed.data.id);
  return { ok: true, message: 'Notas guardadas' };
}

export async function retryNotification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Lead inválido' };
  const db = await supabaseSession();
  const { data: lead } = await db.from('leads').select('*').eq('id', id.data).maybeSingle();
  if (!lead) return { ok: false, error: 'El lead no existe' };
  try {
    await sendLeadNotification({ name: lead.name, email: lead.email, phone: lead.phone, service: lead.service, message: lead.message });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'error desconocido';
    await updateLead(id.data, { notify_error: message });   // se guarda para diagnóstico; no se muestra
    revalidateLead(id.data);
    return { ok: false, error: 'El email volvió a fallar. El lead sigue guardado.' };
  }
  const error = await updateLead(id.data, { notified_at: new Date().toISOString(), notify_error: null });
  if (error) return { ok: false, error };
  revalidateLead(id.data);
  return { ok: true, message: 'Notificación enviada' };
}
```

`app/admin/(panel)/leads/[id]/page.tsx`: `requireAdmin()`; `const { id } = await params`; `db = await supabaseSession()`; `Promise.all([getLead(db, id), getLeadHistory(db, id)])`; `notFound()` si null. Renderiza: encabezado (nombre, `<StatusBadge>`, fecha), tarjeta de datos (teléfono con `tel:` normalizado, email `mailto:` si no vacío, servicio, origen, mensaje, UTM si existen), `<LeadActions lead={lead} whatsappHref={leadWhatsAppLink(lead)} />`, `<LeadHistory rows={history} />`.

`LeadActions.tsx` (client): tres formularios con `useActionState`: select de estado (envía al cambiar), textarea de notas con botón "Guardar notas", y si `lead.notify_error && !lead.notified_at` un bloque destacado "La notificación por email falló" con botón "Reintentar". Botones "Responder por WhatsApp" (`<a href={whatsappHref} target="_blank" rel="noopener noreferrer">`, oculto si null) y "Llamar" (`tel:`). Cada resultado muestra `toast.success(message)` / `toast.error(error)` de `sonner` (`import { toast } from 'sonner'`).

`LeadHistory.tsx`: lista de `AuditRow`: fecha, acción traducida (`insert` → "Creado", `update` → "Actualizado", `delete` → "Eliminado") y, para `update`, los campos que cambiaron entre `before` y `after` (`status`, `notes`, `notified_at`) en formato "estado: nuevo → contactado". `user_id` se muestra como "sistema" cuando es null.

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/lead-actions.test.ts && npx tsc --noEmit`
- [ ] **Step 4: Probar a mano** — cambiar estado y notas desde el celular (`npm run dev` + IP de la red local); ver el historial crecer.
- [ ] **Step 5: Commit** — `git add app tests/unit/lead-actions.test.ts && git commit -m "feat: lead detail with status, notes, whatsapp reply, notification retry and history"`

---

### Task 13: Alta manual de leads

**Files:**
- Modify: `app/admin/(panel)/leads/actions.ts` (agregar `createLead`)
- Create: `app/admin/(panel)/leads/nuevo/page.tsx`, `app/admin/(panel)/leads/nuevo/LeadForm.tsx`
- Test: `tests/unit/lead-actions.test.ts` (agregar casos)

**Interfaces:**
- Produces: `createLead(prev: ActionState, formData: FormData): Promise<ActionState>` — campos `name, phone, email, service, service_other, source, message, status`; al crear, `redirect('/admin/leads/<id>')`

- [ ] **Step 1: Tests (fallan)** — agregar al mock de `supabaseSession` un `insert: (row) => { insertMock(row); return { select: () => ({ single: selectSingle }) }; }` y `vi.mock('next/navigation', ...)` que lanza `REDIRECT:<to>`; casos:

```ts
  it('createLead usa el texto libre cuando el servicio es "otro" y redirige al detalle', async () => {
    selectSingle.mockResolvedValue({ data: { id: ID }, error: null });
    await expect(createLead({ ok: false }, fd({ name: 'Juan', phone: '6000-0000', email: '', service: 'otro', service_other: 'Jardinería', source: 'call', message: 'llamó', status: 'contactado' })))
      .rejects.toThrow(`REDIRECT:/admin/leads/${ID}`);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ service: 'Jardinería', source: 'call', status: 'contactado', email: '' }));
  });
  it('createLead devuelve el primer error de validación', async () => {
    const r = await createLead({ ok: false }, fd({ name: 'J', phone: '6000-0000', email: '', service: 'Pintura', source: 'call', message: 'llamó' }));
    expect(r).toEqual({ ok: false, error: 'El nombre es muy corto' });
    expect(insertMock).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2: Implementar**

```ts
// en app/admin/(panel)/leads/actions.ts
import { redirect } from 'next/navigation';
import { manualLeadSchema } from '@/lib/validation/lead-manual';

export async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const service = raw.service === 'otro' ? raw.service_other : raw.service;
  const parsed = manualLeadSchema.safeParse({ ...raw, service });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const db = await supabaseSession();
  const { data, error } = await db.from('leads').insert(parsed.data).select('id').single();
  if (error || !data) return { ok: false, error: friendlyDbError(error?.code) };
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  redirect(`/admin/leads/${data.id}`);
}
```

`LeadForm.tsx` (client, `useActionState(createLead, ...)`): campos con `<Label>`/`<Input>`/`<Textarea>`; `service` como `<select>` con los servicios publicados (props `services: { slug: string; title: string }[]`, título como valor) + opción "Otro" que muestra `service_other`; `source` como dos radios "WhatsApp" / "Llamada"; `status` como radios "Nuevo" / "Contactado"; error bajo el formulario con `role="alert"`. La página (`nuevo/page.tsx`) obtiene `getServices()` (cliente público, sin cookies: es contenido publicado) y renderiza `<LeadForm services={...} />`.

- [ ] **Step 3: PASS** → **Step 4: Commit** — `git add app tests/unit && git commit -m "feat: manual lead creation from the panel"`

---

### Task 14: Seguridad — contraseña, TOTP, sesiones, accesos

**Files:**
- Create: `app/admin/(panel)/seguridad/page.tsx`, `app/admin/(panel)/seguridad/actions.ts`, `app/admin/(panel)/seguridad/PasswordForm.tsx`, `app/admin/(panel)/seguridad/TotpManage.tsx`
- Test: `tests/unit/security-actions.test.ts`

**Interfaces:**
- Produces: `changePassword(prev, formData)` (campos `password`, `confirm`; mínimo 10 caracteres, iguales); `signOutEverywhere(): Promise<void>` (`signOut({ scope: 'global' })` + redirect a login)

- [ ] **Step 1: Tests (fallan)**

```ts
// tests/unit/security-actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
const updateUser = vi.fn();
const signOut = vi.fn();
vi.mock('@/lib/admin/session', () => ({ requireAdmin: async () => ({ userId: 'u1', email: 'a@b.co', aal: 'aal2' }) }));
vi.mock('@/lib/supabase/session', () => ({ supabaseSession: async () => ({ auth: { updateUser, signOut } }) }));
vi.mock('next/navigation', () => ({ redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } }));
vi.mock('server-only', () => ({}));
import { changePassword, signOutEverywhere } from '@/app/admin/(panel)/seguridad/actions';
const fd = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f; };
beforeEach(() => { updateUser.mockReset(); signOut.mockReset(); });

describe('seguridad', () => {
  it('exige 10 caracteres y confirmación igual', async () => {
    expect((await changePassword({ ok: false }, fd({ password: 'corta', confirm: 'corta' }))).error).toBe('La contraseña debe tener al menos 10 caracteres');
    expect((await changePassword({ ok: false }, fd({ password: 'larga-y-segura', confirm: 'otra-distinta' }))).error).toBe('Las contraseñas no coinciden');
    expect(updateUser).not.toHaveBeenCalled();
  });
  it('cambia la contraseña', async () => {
    updateUser.mockResolvedValue({ error: null });
    expect(await changePassword({ ok: false }, fd({ password: 'larga-y-segura', confirm: 'larga-y-segura' }))).toEqual({ ok: true, message: 'Contraseña actualizada' });
    expect(updateUser).toHaveBeenCalledWith({ password: 'larga-y-segura' });
  });
  it('cierra todas las sesiones y redirige', async () => {
    signOut.mockResolvedValue({ error: null });
    await expect(signOutEverywhere()).rejects.toThrow('REDIRECT:/admin/login');
    expect(signOut).toHaveBeenCalledWith({ scope: 'global' });
  });
});
```

- [ ] **Step 2: Implementar**

```ts
// app/admin/(panel)/seguridad/actions.ts
'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { supabaseSession } from '@/lib/supabase/session';
import type { ActionState } from '@/app/admin/(panel)/leads/actions';

const passwordSchema = z.object({
  password: z.string().min(10, 'La contraseña debe tener al menos 10 caracteres').max(200),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] });

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = passwordSchema.safeParse({ password: formData.get('password'), confirm: formData.get('confirm') });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  const supabase = await supabaseSession();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: 'No se pudo cambiar la contraseña. Intente de nuevo.' };
  return { ok: true, message: 'Contraseña actualizada' };
}

export async function signOutEverywhere(): Promise<void> {
  await requireAdmin();
  const supabase = await supabaseSession();
  await supabase.auth.signOut({ scope: 'global' });
  redirect('/admin/login');
}
```

`page.tsx`: `requireAdmin()`; datos de la cuenta (email de la sesión y `full_name` de `profiles` leído con el cliente de sesión); `<PasswordForm />`; `<TotpManage />`; formulario con `action={signOutEverywhere}` y botón "Cerrar sesión en todos los dispositivos"; tabla "Últimos accesos" con las 20 filas más recientes de `audit_log` donde `user_id = session.userId` y `action in ('login.ok','login.failed','login.blocked')` (fecha y resultado traducido: "Entró", "Contraseña incorrecta", "Bloqueado").

`TotpManage.tsx` (client): `listFactors()` → muestra "Segundo factor: configurado el {created_at}"; botón "Regenerar" abre un `<Dialog>` que pide el código vigente, hace `challenge`+`verify` con el factor actual y luego `mfa.unenroll({ factorId })` y `router.replace('/admin/2fa')` para inscribir uno nuevo. Errores en español bajo el campo.

- [ ] **Step 3: PASS** → **Step 4: Commit** — `git add app tests/unit/security-actions.test.ts && git commit -m "feat: security page — password change, totp regeneration, global sign-out, access log"`

---

### Task 15: El endpoint de contacto registra el resultado de la notificación

**Files:**
- Modify: `app/api/contact/route.ts`
- Modify: `tests/unit/contact-route.test.ts`

**Interfaces:**
- Consumes: `supabaseAdmin()` tipado (Task 5)
- Produces: tras insertar el lead, `notified_at` (éxito) o `notify_error` (fallo) quedan escritos; el contrato de respuesta no cambia

- [ ] **Step 1: Tests (fallan)** — reemplazar el mock de `@/lib/supabase/admin` en `tests/unit/contact-route.test.ts`:

```ts
const insertMock = vi.fn(async () => ({ data: { id: 'L1' }, error: null as { message: string; code?: string } | null }));
const updateMock = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: () => ({
    from: () => ({
      insert: () => ({ select: () => ({ single: insertMock }) }),
      update: (patch: unknown) => { updateMock(patch); return { eq: async () => ({ error: null }) }; },
    }),
  }),
}));
```

Ajustar `beforeEach` (`insertMock.mockResolvedValue({ data: { id: 'L1' }, error: null })`; `updateMock.mockReset()`), el caso "si el insert falla" (`insertMock.mockResolvedValue({ data: null, error: { message: 'db exploded at /var/lib/pg' } })`) y agregar:

```ts
  it('email ok → escribe notified_at', async () => {
    await POST(makeRequest(valid));
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ notified_at: expect.any(String) }));
  });
  it('email falla → escribe notify_error sin credenciales y sigue 200', async () => {
    sendMock.mockRejectedValue(new Error('535 auth failed for user@gmail.com'));
    const res = await POST(makeRequest(valid));
    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({ notify_error: '535 auth failed for user@gmail.com' });
  });
```

- [ ] **Step 2: Implementar** — en `app/api/contact/route.ts`:

```ts
  const admin = supabaseAdmin();
  const { data: inserted, error: dbError } = await admin.from('leads').insert({
    ...lead, source: 'form', ip_hash: hashIp(ip), user_agent: request.headers.get('user-agent') ?? undefined,
  }).select('id').single();
  if (dbError || !inserted) {
    console.error('lead_insert_failed', { code: dbError?.code });
    return NextResponse.json({ ok: false, error: 'No pudimos registrar su solicitud. Intente de nuevo o escríbanos por WhatsApp.' }, { status: 500 });
  }

  // 2) Notificar — best effort. El resultado queda en el lead para que el panel lo muestre.
  try {
    await sendLeadNotification(lead);
    await admin.from('leads').update({ notified_at: new Date().toISOString() }).eq('id', inserted.id);
  } catch (e) {
    console.error('email_failed: lead guardado, notificación pendiente', { leadId: inserted.id });
    await admin.from('leads').update({ notify_error: e instanceof Error ? e.message : 'error desconocido' }).eq('id', inserted.id);
  }
  return NextResponse.json({ ok: true });
```

- [ ] **Step 3: PASS** — `npx vitest run tests/unit/contact-route.test.ts` (8/8)
- [ ] **Step 4: Commit** — `git add app/api tests/unit/contact-route.test.ts && git commit -m "feat: contact endpoint records notification outcome for the panel"`

---

### Task 16: E2E del panel, script de admin, Playwright contra el stack local, CI y README

**Files:**
- Create: `scripts/create-admin.mjs`, `tests/e2e/global-setup.ts`, `tests/e2e/admin.spec.ts`
- Modify: `playwright.config.ts`, `.github/workflows/ci.yml`, `README.md`, `package.json` (script `admin:create`)

**Interfaces:**
- Produces: `node scripts/create-admin.mjs <email> <password> [nombre]` → crea/recrea el usuario y un factor TOTP verificado; escribe `test-results/admin-totp.json` = `{ email, password, secret }` (solo local/CI)

- [ ] **Step 1: Script**

```js
// scripts/create-admin.mjs — SOLO local y CI: usa la secret key del stack local.
import { createClient } from '@supabase/supabase-js';
import * as OTPAuth from 'otpauth';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const [email = 'admin@test.local', password = 'Prueba-segura-2026', fullName = 'Admin Pruebas'] = process.argv.slice(2);
if (!secret || !publicKey) throw new Error('Faltan las claves del stack local (ver .env.test)');
if (!/127\.0\.0\.1|localhost/.test(url)) throw new Error('Este script solo corre contra el stack local');

const admin = createClient(url, secret, { auth: { persistSession: false } });
const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
const existing = list?.users.find((u) => u.email === email);
if (existing) await admin.auth.admin.deleteUser(existing.id);
const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
if (error) throw error;

const user = createClient(url, publicKey, { auth: { persistSession: false } });
const { error: e1 } = await user.auth.signInWithPassword({ email, password });
if (e1) throw e1;
const { data: enrolled, error: e2 } = await user.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Panel Viang' });
if (e2) throw e2;
const { data: challenge } = await user.auth.mfa.challenge({ factorId: enrolled.id });
const code = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(enrolled.totp.secret), digits: 6, period: 30, algorithm: 'SHA1' }).generate();
const { error: e3 } = await user.auth.mfa.verify({ factorId: enrolled.id, challengeId: challenge.id, code });
if (e3) throw e3;

mkdirSync('test-results', { recursive: true });
writeFileSync('test-results/admin-totp.json', JSON.stringify({ email, password, secret: enrolled.totp.secret }));
console.log(`Usuario ${email} listo con TOTP. Secreto en test-results/admin-totp.json`);
```

`package.json`: `"admin:create": "node --env-file=.env.test scripts/create-admin.mjs"`.

- [ ] **Step 2: Playwright contra el stack local**

```ts
// tests/e2e/global-setup.ts
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

export default async function globalSetup() {
  execFileSync('node', ['--env-file=.env.test', 'scripts/create-admin.mjs'], { stdio: 'inherit' });
  // Un lead conocido para el flujo del panel.
  const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const admin = createClient(url, key, { auth: { persistSession: false } });
  await admin.from('leads').delete().eq('name', 'E2E Panel');
  await admin.from('leads').insert({ name: 'E2E Panel', email: 'e2e@t.co', phone: '6000-0099', service: 'Limpieza Especializada', message: 'lead de prueba e2e' });
}
```

`playwright.config.ts`: cargar `.env.test` como hace `vitest.config.mts` (mismo bucle sobre `fs.readFileSync`) en un objeto `testEnv`; agregar `globalSetup: './tests/e2e/global-setup.ts'`; en `webServer` cambiar `command` a `npm run dev -- -p 3100` y agregar:

```ts
    env: {
      ...testEnv,
      NEXT_PUBLIC_SUPABASE_URL: testEnv.SUPABASE_URL ?? 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: testEnv.SUPABASE_ANON_KEY ?? '',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      EMAIL_USER: 'nadie@example.com', EMAIL_PASS: 'invalida', ANALYTICS_SALT_SECRET: 'e2e',
    },
```

y exportar `testEnv` para que `global-setup.ts` lo use (`process.env` ya lo tiene si el config lo asigna con `Object.assign(process.env, testEnv)` antes de exportar).

- [ ] **Step 3: E2E (falla hasta que todo esté integrado)**

```ts
// tests/e2e/admin.spec.ts
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import * as OTPAuth from 'otpauth';

const admin = JSON.parse(readFileSync('test-results/admin-totp.json', 'utf8')) as { email: string; password: string; secret: string };
const code = () => new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(admin.secret), digits: 6, period: 30, algorithm: 'SHA1' }).generate();

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(admin.email);
  await page.getByLabel('Contraseña').fill(admin.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/2fa/);
  await page.getByLabel(/código de 6 dígitos/i).fill(code());
  await page.getByRole('button', { name: 'Verificar' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe('panel: segundo camino del dinero', () => {
  test.skip(({ isMobile }) => isMobile, 'una vez basta: proyecto desktop');

  test('anónimo en /admin/leads termina en login', async ({ page }) => {
    await page.goto('/admin/leads');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login → TOTP → Inicio muestra las cifras', async ({ page }) => {
    await login(page);
    await expect(page.getByText(/nuevos/i).first()).toBeVisible();
  });

  test('cambia el estado de un lead y lo ve en la lista y el historial', async ({ page }) => {
    await login(page);
    await page.goto('/admin/leads?q=E2E');
    await page.getByRole('link', { name: /e2e panel/i }).first().click();
    await page.getByLabel(/estado/i).selectOption('contactado');
    await expect(page.getByText(/estado actualizado/i)).toBeVisible();
    await page.getByLabel(/notas/i).fill('Llamado el lunes');
    await page.getByRole('button', { name: /guardar notas/i }).click();
    await expect(page.getByText(/notas guardadas/i)).toBeVisible();
    await expect(page.getByText(/nuevo → contactado/i)).toBeVisible();
    await page.goto('/admin/leads?estado=contactado&q=E2E');
    await expect(page.getByRole('link', { name: /e2e panel/i }).first()).toBeVisible();
  });

  test('exporta CSV con el filtro activo', async ({ page }) => {
    await login(page);
    await page.goto('/admin/leads?q=E2E');
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: /exportar csv/i }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^leads-\d{4}-\d{2}-\d{2}\.csv$/);
    const text = readFileSync(await file.path() as string, 'utf8');
    expect(text).toContain('E2E Panel');
  });
});
```

- [ ] **Step 4: CI** — en `ci.yml`, job `build-and-budget`: el paso `npx playwright test` ya corre con el stack arriba; agregar antes `- run: cp .env.test .env.test.ci || true` no es necesario — `global-setup` lee `.env.test` del repo. Verificar que las variables `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` del workflow no falten: si el job las necesita, agregarlas al bloque `env:` copiando los valores demo de `.env.test`.

- [ ] **Step 5: README** — sección "Panel administrativo": cómo entrar (`/admin`), usuarios (invitación desde el dashboard; `npm run admin:create` solo local), TOTP obligatorio, `npm run test:e2e` requiere `npx supabase start`, configuración del dashboard en producción (lista de §11 del spec).

- [ ] **Step 6: Verificar todo**

Run: `npx supabase start && npx vitest run && npx playwright test && npm run build && npx @lhci/cli@0.14.x autorun; git checkout -- .lighthouseci && git clean -fdq .lighthouseci`
Expected: unit + RLS en verde; e2e: 6 de la Fase 1 + 4 del panel; build con `/admin/*` dinámicas; Lighthouse del sitio ≥ 95 / < 500 KB.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "test: admin e2e money path with totp, local-stack playwright, ci and readme"`

---

## Verificación final de 2a (spec §10)

- [ ] Sin sesión, `/admin/*` → login; con contraseña sin TOTP → `/admin/2fa` (e2e + proxy.test)
- [ ] Un usuario sin factor lo inscribe en el primer acceso (probado a mano en Task 9)
- [ ] Con JWT `aal1`, la API REST devuelve 0 leads (admin.test)
- [ ] 5 contraseñas incorrectas bloquean 15 min y quedan en `audit_log` (hook.test)
- [ ] Un lead del formulario aparece en Inicio como "nuevo" sin desplegar (manual: enviar el formulario público con el stack local y abrir Inicio)
- [ ] Estado y notas desde el celular en un toque cada uno, con historial (Task 12 manual + e2e)
- [ ] Alta manual con email vacío y `created_by` (admin.test + Task 13)
- [ ] "Responder por WhatsApp" abre wa.me con el mensaje (manual)
- [ ] Email fallido visible y reintentable (lead-actions.test + manual con `EMAIL_PASS` inválida)
- [ ] CSV filtrado, abre en Excel con acentos (e2e + abrirlo)
- [ ] Anónimo no fabrica leads "ganados" (admin.test)
- [ ] Cabeceras de seguridad en todas las respuestas (proxy.test + `curl -I`)
- [ ] Lighthouse móvil del sitio público ≥ 95 y < 500 KB (Task 16 Step 6)
- [ ] `npx vitest run` y `npx playwright test` en verde local y en CI

Pendiente del cliente antes de producción (spec §11): claves publishable/secret, registro desactivado, TOTP habilitado, hook activado, SMTP propio, URLs de redirección, invitar usuarios, `supabase db push`.
