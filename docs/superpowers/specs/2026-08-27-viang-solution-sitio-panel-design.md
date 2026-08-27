# Viang Solution — Sitio, Panel, Analítica y Linktree

**Fecha:** 2026-08-27
**Estado:** Diseño aprobado, pendiente de plan de implementación
**Producto:** 1 de 2 (el Producto 2 —plataforma de automatización con n8n y agentes— tiene spec propio)

---

## 1. Resumen ejecutivo

Reemplazar el sitio estático actual de Viang Solution por una aplicación Next.js con
contenido administrable, analítica propia y una página de enlaces para redes sociales.

El objetivo comercial es concreto: **que el sitio genere ventas por sí solo**. Todo lo
demás —diseño, animaciones, panel— existe para servir a eso.

Se construye sobre una fundación que ya contempla los ganchos de integración que el
Producto 2 va a necesitar, para no reescribir el backend dentro de tres meses.

---

## 2. Estado actual (verificado el 2026-08-27)

| Área | Situación |
|---|---|
| Frontend | `index.html` (348 líneas) y `contact.html` (381), Tailwind por CDN, sin build |
| Backend | `server.js` — un endpoint de contacto con Nodemailer |
| Base de datos | Ninguna |
| Autenticación | Ninguna |
| Analítica | Ninguna |
| Contenido | Hardcodeado: 6 servicios, 9 logos de clientes |
| Assets | **24 MB** (`limpieza.mp4` 13 MB, `PISOS.jpg` 6.9 MB) |
| Repositorio | `node_modules/` versionado: 1050 de 1088 archivos |
| Historial git | Limpio — sin credenciales (verificado sobre las 5 ramas remotas) |

### Deudas que este diseño resuelve

1. **`express.static` sirve la raíz del proyecto** → `server.js` y `package.json` son
   descargables por HTTP.
2. **Turnstile desactivado** salvo `NODE_ENV=production`, y el cliente inyecta un
   `dummy-token`. El formulario es spameable hoy.
3. **`node_modules/` versionado** → hace inviable cualquier build moderno.
4. **`console.log` imprime `EMAIL_USER`** en cada arranque.
5. **Errores del servidor filtran rutas del sistema de archivos** al cliente.
6. **9 recursos desde CDNs sin verificación de integridad.**
7. **Assets sin optimizar**: 24 MB en la primera carga móvil.

---

## 3. Objetivos y criterios de éxito

### Objetivos de negocio

- El visitante en celular puede contactar en **un solo toque**, desde cualquier punto de la página.
- El dueño edita el contenido **sin tocar código y sin miedo a romper el sitio**.
- Cada visita queda medida hasta la conversión, no solo contada.
- Ningún lead se pierde, aunque falle el correo.

### Criterios medibles

| Métrica | Objetivo |
|---|---|
| Peso de la primera carga móvil | **< 500 KB** (hoy: 24 MB) |
| LCP en 4G | < 2.5 s |
| CLS | < 0.1 |
| JavaScript inicial | < 100 KB |
| Lighthouse móvil (rendimiento) | > 95 |
| Accesibilidad | WCAG 2.1 AA |
| Tiempo de carga de `/links` | < 1 s en 4G |

---

## 4. Alcance

### Dentro

- Web pública rediseñada (home, páginas de servicio, contacto)
- Panel administrativo con autenticación y 2FA
- Analítica propia sin cookies
- Fundación: build, base de datos, autenticación, seguridad, despliegue
- Ganchos de integración para el Producto 2 (eventos, webhooks, tokens de servicio)

### Fuera (Producto 2, spec propio)

- n8n y flujos de automatización
- Agente de WhatsApp, agente de voz (ElevenLabs + Twilio)
- Gestión de redes sociales, prospección

### Fuera (descartado deliberadamente)

Blog, chat en vivo, pagos en línea, multi-idioma, app nativa. Ninguno aporta a los
objetivos y todos suman mantenimiento y superficie de ataque.

**Linktree** (descartado el 2026-08-27 por decisión del cliente): con la web pública
en producción, el rol de la página de enlaces lo cumple el propio sitio. Las tablas
`links`/`link_clicks` no se implementan; si algún día se retoma, el diseño de §11
sigue siendo válido.

### Diferido

**Cotizador estimado.** Requiere tarifas base que aún no existen. El campo
`services.price_from` queda en el esquema para habilitarlo sin migración.

---

## 5. Arquitectura

### Stack

| Capa | Elección | Justificación |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | Un codebase para las 4 piezas |
| Estilos | Tailwind CSS v4 compilado | Elimina el CDN que hoy bloquea el render |
| Base de datos | Supabase Postgres | Elección del cliente |
| Autenticación | Supabase Auth + TOTP | No se escribe manejo de contraseñas propio |
| Almacenamiento | Supabase Storage + `next/image` | Optimización automática a AVIF/WebP |
| Animación | CSS + IntersectionObserver; Framer Motion puntual | Movimiento sin costo de carga |
| Email | Nodemailer (se conserva) | Ya funciona |
| Despliegue | Docker multi-stage + Cloudflare Tunnel | Portable a VPS sin reescribir |

### Estructura del repositorio

```
app/
  (public)/
    page.tsx                  # home
    servicios/[slug]/page.tsx
    contacto/page.tsx
  links/page.tsx              # linktree
  admin/                      # panel protegido
  api/
    contact/route.ts
    track/route.ts
    health/route.ts
    agent/                    # tools para el Producto 2
components/
  ui/                         # primitivos
  sections/                   # secciones de la home
lib/
  supabase/{server,browser}.ts
  analytics/
  validation/                 # esquemas Zod
supabase/migrations/          # SQL versionado en git
public/                       # assets optimizados
docs/superpowers/specs/
```

### Flujo de datos

- **Página pública** → Server Component lee con clave anónima → RLS filtra → HTML cacheado (ISR)
- **Panel** → Server Action con sesión del admin → RLS autoriza → escribe → revalida caché pública
- **Visita** → `POST /api/track` → inserta y termina
- **Lead** → inserta en `leads` → emite evento → notifica (email + push)

---

## 6. Seguridad

Requisito de primer nivel. Defensa en profundidad: ninguna capa es suficiente sola.

### Capa 1 — Borde (Cloudflare)

Tunnel: **sin puertos abiertos en el router, IP doméstica nunca expuesta**. El tráfico
solo llega a través de Cloudflare. WAF con reglas gestionadas, rate limiting, Bot Fight
Mode, SSL Full (strict), protección DDoS.

### Capa 2 — Acceso al panel

- Supabase Auth con **2FA (TOTP) obligatorio**
- Sin registro público: usuarios solo por invitación
- Sesión en cookies `httpOnly` + `Secure` + `SameSite=Lax` — nunca en `localStorage`
- Bloqueo tras intentos fallidos; cada login registrado en `audit_log`

### Capa 3 — Autorización (RLS)

RLS activo en **todas** las tablas. Patrón único:

- Público: `SELECT` solo donde `published = true`
- Escritura: exige rol admin, verificado en el servidor
- `leads` y `page_views`: el público puede `INSERT`, **nunca** `SELECT`
- La clave `service_role` jamás llega al navegador

### Capa 4 — Entrada de datos

Validación con Zod **en el servidor**. Turnstile con verificación real y sin bypass por
entorno. Rate limiting por IP en `/api/contact`. Límite de tamaño de body. Validación de
tipo y peso en cada subida a Storage.

> **Detrás del Tunnel, la IP del cliente llega en la cabecera `CF-Connecting-IP`.** El
> `remoteAddress` del socket es siempre el de `cloudflared`. Si se usa ese, el rate limiting
> agrupa a todos los visitantes en un solo cubo y queda inservible. Aplica igual al
> `ip_hash` de `leads` y al `visitor_hash` de la analítica.

### Capa 5 — Navegador

**CSP estricta con nonce** — elimina el vector de los 9 CDNs sin integridad. Más HSTS,
`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

### Capa 6 — Contenedor

Build multi-stage sin devDependencies, **usuario no-root**, filesystem de solo lectura,
`.dockerignore` que excluya `.claude/` y `.env`.

### Capa 7 — Secretos y dependencias

`npm ci` con lockfile, auditoría en CI, Dependabot. Se elimina el log de `EMAIL_USER`.
Credenciales actuales rotadas antes del despliegue.

### Riesgos residuales aceptados

- **VM doméstica**: si el equipo se compromete por otra vía, el contenedor está expuesto.
  Mitigado con usuario no-root y filesystem de solo lectura.
- **Disponibilidad**: cortes de luz o internet tumban el sitio. Mitigado con la página de
  mantenimiento de Cloudflare (§14).

---

## 7. Modelo de datos

### Patrón común

Toda tabla de contenido comparte: `id uuid`, `sort_order int`, `published boolean`,
`created_at`, `updated_at`. Esto permite que el panel use **un solo editor** para todas.

### Tablas

**`site_settings`** — fila única
`phone`, `whatsapp`, `email`, `address`, `business_hours` (jsonb), `social_links` (jsonb),
`seo_title`, `seo_description`, `og_image`

**`services`**
`slug` (único), `title`, `short_description`, `long_description`, `icon`, `image_path`,
`faq` (jsonb), `price_from` (nullable — habilita el cotizador diferido), + patrón común

**`clients`**
`name`, `logo_path`, `website_url`, + patrón común

**`projects`** — portafolio
`title`, `service_id` (FK), `description`, `image_before`, `image_after`, `completed_at`,
+ patrón común

**`testimonials`**
`author_name`, `company`, `content`, `rating`, `avatar_path`, + patrón común

**`stats`**
`label`, `value`, `suffix`, `icon`, + patrón común

**`leads`**
`name`, `email`, `phone`, `service`, `message`, `source` (form|whatsapp|call|agent),
`status` (nuevo|contactado|cotizado|ganado|perdido), `notes`, `utm_*`, `ip_hash`,
`user_agent`, `created_at`

**`appointments`**
`lead_id` (FK), `scheduled_at`, `service_id` (FK), `status`, `notes`

**`page_views`**
`path`, `referrer`, `utm_*`, `country`, `device_type`, `browser`, `visitor_hash`, `created_at`

**`page_views_daily`** — agregado
Resumen diario para que el panel sea rápido. Los datos crudos se borran a los 90 días.

**`links`** — linktree
`title`, `url`, `icon`, `description`, + patrón común

**`link_clicks`**
`link_id` (FK), `referrer`, `device_type`, `created_at`

**`social_posts`** — Producto 2
`content`, `media_path`, `platform`, `status` (borrador|aprobado|publicado), `scheduled_at`

**`prospects`** — Producto 2, reservada
`business_name`, `contact`, `source`, `status`, `score`

**`profiles`**
`user_id` (FK a `auth.users`), `role`, `full_name`

**`audit_log`**
`user_id`, `table_name`, `record_id`, `action`, `before` (jsonb), `after` (jsonb),
`created_at` — habilita la función de deshacer

**`events`** — cola de salida
`type`, `payload` (jsonb), `delivered_at` — n8n escucha acá

**`webhooks`**
`url`, `event_types` (array), `secret`, `active`

**`service_tokens`**
`name`, `token_hash`, `scopes` (array), `last_used_at`, `revoked_at`

### Reglas de contenido

**Secciones vacías se ocultan solas.** `projects`, `testimonials` y `stats` nacen vacías.
La página no muestra hueco ni "próximamente" — la sección no se renderiza hasta que haya
al menos un registro publicado. Esto permite lanzar de inmediato y crecer sin tocar código.

**Los leads se guardan antes de enviarse.** El email es una notificación, no el registro.

---

## 8. Web pública

### Páginas

`/` · `/servicios/[slug]` (×6) · `/contacto` · `/links`

### Home, en orden de conversión

1. **Hero** — imagen fija en móvil, video en escritorio. Titular directo, indicador
   "Abierto ahora · respondemos en minutos", dos CTA: WhatsApp (primario) y Cotizar.
2. **Franja de confianza** — los 9 logos de clientes, inmediatamente bajo el hero.
   Prueba social antes de pedir nada.
3. **Servicios** — 6 tarjetas, cada una enlaza a su página propia.
4. **Quiénes somos** — con la foto real del equipo.
5. **Cifras** — oculta hasta cargar contenido.
6. **Portafolio antes/después** — oculta hasta cargar contenido.
7. **Testimonios** — oculta hasta cargar contenido.
8. **Cotización** — formulario por pasos (servicio → detalle → datos).
9. **Footer**

### Móvil

Barra fija inferior con **WhatsApp · Llamar · Cotizar**, en zona de pulgar. El visitante
nunca está a más de un toque del contacto. Áreas táctiles ≥ 44 px, texto ≥ 16 px.

### Diseño

La marca vende limpieza; el diseño debe sentirse limpio: mucho aire, azules profundos con
acento cálido en los CTA, tipografía grande y contrastada, esquinas suaves, sombras difusas.

### Movimiento

Calma, no espectáculo. Apariciones suaves al hacer scroll, hover que responde al instante,
contadores que suben al entrar en pantalla, transiciones de 200–300 ms. Nada que rebote,
parpadee o secuestre el scroll. Respeta `prefers-reduced-motion`. **Ninguna animación
retrasa el contenido.**

### Imágenes

**Plan de optimización — de 24 MB a < 500 KB:**

| Archivo | Hoy | Acción |
|---|---|---|
| `limpieza.mp4` | 13 MB | Comprimir; **solo en escritorio**. En móvil, imagen fija. |
| `PISOS.jpg` | 6.9 MB | AVIF vía `next/image` (~80 KB) |
| `breadcrumb.png` | 1.1 MB | AVIF |
| `org.chromium.Chromium.sksvEK.png` | 1.1 MB | **Eliminar** — captura subida por error |

**Imágenes de banco:** permitidas para fondos, texturas, ambientes e iconografía.
**Prohibidas** para portafolio, equipo o cualquier cosa que afirme ser trabajo de Viang
Solution. Fuentes: Unsplash y Pexels (licencia comercial libre). Todas reemplazables desde
el panel.

### SEO

Una URL por servicio con FAQ y datos estructurados (`Service`, `LocalBusiness`,
`FAQPage`), para competir en búsquedas locales del tipo "limpieza de alfombras Panamá".
Sitemap y `robots.txt` generados. Metadatos y Open Graph editables desde `site_settings`.

---

## 9. Panel administrativo

Ruta `/admin`, protegida por middleware + Supabase Auth con 2FA.

**Secciones:** Inicio · Leads · Citas · Contenido · Linktree · Analítica · Configuración ·
Integraciones · Seguridad

### Editor único

Como todas las tablas de contenido comparten forma (§7), el editor es uno solo: lista,
arrastrar para reordenar, interruptor de publicado, formulario, subida de imagen con
recorte. El dueño aprende una vez y administra todo.

Al guardar se revalida la caché pública: **el cambio se ve al instante**, sin desplegar.

### Funciones

- **PWA instalable** en el celular, con **notificación push al entrar un lead**
- **Responder por WhatsApp** desde cada lead, con mensaje pre-armado (nombre + servicio)
- **Exportar leads a CSV**
- **Deshacer cambios** desde `audit_log` — el dueño edita sin miedo
- Gestión de webhooks y tokens de servicio

---

## 10. Analítica

Script propio < 1 KB. **Sin cookies, sin Google Analytics.**

`visitor_hash` = hash de IP (`CF-Connecting-IP`) + user-agent + sal **que rota cada día**.
Permite contar visitantes únicos e impide seguir a una persona entre días. Sin banner de
cookies. La sal diaria se genera y guarda del lado del servidor; no se conserva la sal del
día anterior, lo que hace irreversible la correlación entre días.

El campo `country` se toma de la cabecera `CF-IPCountry` que agrega Cloudflare — sin
librerías de geolocalización ni servicios externos, y sin almacenar la IP en crudo.

### Lo que mide

El embudo, no el tráfico:

```
Visita → Clic en WhatsApp → Lead → Cita → Cliente
```

Más: páginas top, fuentes de tráfico con UTM, dispositivo, país, clics por enlace del
linktree.

### Retención

Datos crudos resumidos a diario en `page_views_daily` y borrados a los 90 días. Los
agregados se conservan indefinidamente.

---

## 11. Linktree *(descartado — ver §4)*

`/links`, editable desde el panel: avatar, nombre, bio y enlaces con orden, icono y
activar/desactivar.

Tres diferencias respecto de un Linktree genérico:

1. **Mismo diseño y tipografía del sitio** — consistencia de marca.
2. **Cuenta clics por enlace** y los envía a la analítica: revela qué red trae clientes.
3. **Ultra liviano.** Llega desde la biografía de Instagram, en móvil, con datos móviles.
   Sin JavaScript pesado. Objetivo: < 1 s.

Con imagen de vista previa propia para compartir por WhatsApp.

---

## 12. Integraciones para el Producto 2

Se incluyen ahora porque son baratas hoy y carísimas después.

- **`events`** — cada lead, cita o cambio de estado emite un evento
- **`webhooks`** — URLs destino configurables desde el panel, firmadas con secreto
- **`service_tokens`** — credenciales revocables con permisos acotados
- **`/api/agent/*`** — endpoints de tools: crear lead, consultar disponibilidad,
  agendar cita, consultar servicios y precios

### Decisión: un cerebro, tres bocas

El conocimiento del negocio y las acciones se definen **una sola vez**, como endpoints de
nuestra API. Los tres canales del Producto 2 —widget de voz en el sitio (ElevenLabs),
WhatsApp texto (LLM vía n8n) y llamadas entrantes (ElevenLabs + Twilio)— consumen los
mismos endpoints.

Esto evita tres versiones de la verdad y el encierro en un proveedor. Cambiar un precio se
hace en un lugar.

**Ruteo por canal según costo:** voz solo donde aporta (llamadas, widget del sitio); el
texto de WhatsApp va por LLM directo, que cuesta centavos por mensaje en vez de por minuto.

---

## 13. Manejo de errores

**Regla número uno: nunca se pierde un lead.**

| Qué falla | Comportamiento |
|---|---|
| Email | Lead ya guardado + reintento + alerta en el panel |
| Red del visitante | Mensaje claro y **se conserva lo escrito** |
| Supabase caído | Páginas públicas siguen sirviéndose desde caché |
| Error del servidor | Página de error amable **con botones de WhatsApp y llamar** |

Ese último punto es deliberado: si algo se rompe, el visitante todavía puede convertir.

Nunca se filtran rastros de error al cliente. Logs estructurados sin credenciales. Mensajes
del panel en español y accionables.

---

## 14. Despliegue y continuidad

```
docker-compose:
  app         → Next.js (multi-stage, no-root, output standalone)
  cloudflared → Tunnel
```

Migraciones SQL versionadas en git, aplicadas al desplegar. `/api/health` para healthcheck
de Docker y Cloudflare. CI en GitHub Actions: lint, tipos, pruebas, auditoría, build y
**Lighthouse — si el rendimiento móvil baja del umbral, el build falla**.

### Respaldos

**El contenido vive en Supabase, no en la VM.** Si el equipo se rompe o se pierde, no se
pierde nada: se levanta el contenedor en otro lado y el sitio vuelve idéntico. Respaldos
automáticos de Supabase más exportación diaria propia.

### Continuidad ante cortes

Como el dominio está en Cloudflare, si la VM no responde **Cloudflare sirve una página de
mantenimiento con el WhatsApp y el teléfono**. Se cae el servidor, no el negocio.

---

## 15. Migración desde lo actual

1. Sacar `node_modules/` del control de versiones — **prerrequisito, no mejora opcional**
2. Migrar assets a `public/`, optimizarlos, eliminar la captura de Chromium
3. Portar el contenido del HTML actual a la base: 6 servicios, 9 clientes, textos
4. Convertir `/api/contact` en Route Handler, conservando la lógica de Nodemailer
5. Eliminar `server.js`, `contact.html`, `index.html` y el JS del cliente
6. Actualizar `Dockerfile`, `docker-compose.yml`, `.dockerignore` y `.env.example`
7. Reescribir el `README.md`

**No se pierde contenido.** Los textos, servicios y logos actuales se conservan.

---

## 16. Pruebas

1. **Pruebas de RLS** — *las más importantes*. Verifican que un anónimo **no puede** leer
   leads, escribir servicios ni ver borradores. Convierte el requisito de seguridad en algo
   comprobado en cada cambio.
2. **Unitarias (Vitest)** — validaciones Zod, cálculo de "abierto ahora", hash de analítica
3. **Integración** — endpoints de contacto, tracking y tools de agentes
4. **End-to-end (Playwright)** — solo los dos caminos que dan dinero: enviar cotización, y
   entrar al panel → editar → verificar en el sitio
5. **Lighthouse en CI** — protege el objetivo de peso

Implementación con TDD: prueba primero, código después.

---

## 17. Criterios de aceptación

- [x] Primera carga móvil < 500 KB; Lighthouse móvil > 95 — *367 KB, performance 99 (Lighthouse móvil, 2026-08-27)*
- [ ] ~~Barra de contacto visible y funcional en todo momento en móvil~~ *(retirada a pedido del cliente, `e46c28b`; el hero y el menú móvil conservan WhatsApp y cotizar)*
- [x] Los 3 servicios (perfil oficial, `34bb9a6`) tienen URL propia y datos estructurados `Service` + `LocalBusiness`
- [ ] FAQ por servicio — *pendiente de contenido del cliente: `services.faq` está vacío, así que no se emite `FAQPage` ni la sección*
- [x] Portafolio y testimonios **no se renderizan** mientras estén vacíos *(verificado en el HTML del contenedor; las cifras ya están publicadas)*
- [x] Un lead enviado con el correo caído **igual queda registrado** *(verificado contra el stack local: 200 `{ok:true}`, fila en `leads`, evento `lead.created`)*; la alerta en el panel es de la Fase 2
- [ ] El panel exige 2FA; sin registro público
- [x] Las pruebas de RLS pasan: anónimo no lee `leads` ni filas no publicadas *(suite local 63/63 y sondeo REST contra el proyecto real)*
- [ ] Editar contenido en el panel se refleja en el sitio sin desplegar
- [ ] El panel se instala en el celular y notifica al entrar un lead
- [ ] `/links` carga en < 1 s y registra clics por enlace
- [ ] La analítica muestra el embudo completo, no solo visitas
- [ ] Un evento de lead nuevo llega a un webhook configurado
- [x] La imagen levanta el sitio con usuario no-root y sistema de archivos de solo lectura *(healthcheck ok, `whoami` = app)*; el Tunnel espera el token del cliente (§18)
- [x] Ninguna respuesta de error expone rutas del sistema ni credenciales *(404, 500 del endpoint y `error.tsx` revisados)*
- [x] Accesibilidad AA verificada *(Lighthouse accessibility 96)*; `prefers-reduced-motion` respetado *(tests de `Reveal` y `Counter`)*

---

## 18. Prerrequisitos del cliente

- [ ] Proyecto de Supabase creado (capa gratuita alcanza)
- [ ] `viangsolution.com` apuntado a Cloudflare
- [ ] **Contraseña de aplicación de Gmail nueva** (rotar la actual)
- [ ] Claves de Cloudflare Turnstile
- [ ] Datos reales: teléfono, dirección, horarios de atención
- [ ] Número de WhatsApp Business *(Producto 2)*

---

## 19. Decisiones registradas

| Decisión | Razón |
|---|---|
| Next.js sobre Astro | Las 4 piezas comparten datos, sesión y diseño; Astro obligaría a dos proyectos |
| Analítica propia sobre Google Analytics | Sin cookies, sin ceder datos de clientes, inmune a bloqueadores |
| Lead a base de datos antes que a email | Hoy un fallo de correo pierde la venta en silencio |
| 2FA obligatorio, no opcional | El eslabón débil será humano, no técnico |
| Secciones vacías ocultas | Permite lanzar sin contenido inventado |
| Video solo en escritorio | 13 MB en 4G es una venta perdida |
| Cotizador diferido | Requiere tarifas que aún no existen; no se inventan precios |
| ElevenLabs solo para voz | En texto se pagaría una tubería de audio sin usar |
| Sin llamadas salientes en frío | Daña la confianza que el sitio construye; obligación de revelar IA |
| Ganchos de integración desde el día uno | Baratos ahora, reescritura del backend después |
