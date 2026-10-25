/**
 * Static export for Cloudflare Workers assets.
 * Parks app/api (POST /api/contact cannot be statically exported), optionally
 * bakes published Supabase rows into remote-snapshot.json, runs `next build`,
 * then restores both so the Node/Docker build is unchanged.
 */
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'app', 'api');
const holdDir = path.join(root, '.static-export-hold');
const holdApi = path.join(holdDir, 'api');
const snapshotPath = path.join(root, 'lib', 'content', 'remote-snapshot.json');
const layoutPath = path.join(root, 'app', 'layout.tsx');
const REVALIDATE_NODE = 'export const revalidate = 300;';
const REVALIDATE_STATIC = 'export const revalidate = false;';

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        STATIC_EXPORT: '1',
        NEXT_PUBLIC_STATIC_EXPORT: '1',
      },
    });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`next build exited ${code}`))));
  });
}

async function parkApi() {
  await mkdir(holdDir, { recursive: true });
  if (await exists(holdApi) && !(await exists(apiDir))) {
    await rename(holdApi, apiDir);
  }
  await rename(apiDir, holdApi);
}

async function restoreApi() {
  if (await exists(holdApi)) {
    if (await exists(apiDir)) await rm(apiDir, { recursive: true, force: true });
    await rename(holdApi, apiDir);
  }
  await rm(holdDir, { recursive: true, force: true });
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function fetchPublished() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('Supabase public env absent — static export uses lib/content/fallback.ts');
    return null;
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const get = async (table) => {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&order=sort_order.asc`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${table} responded ${res.status}`);
    return res.json();
  };
  const settingsRows = await fetch(`${url}/rest/v1/site_settings?select=*&limit=1`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!settingsRows.ok) throw new Error(`site_settings responded ${settingsRows.status}`);
  const settingsList = await settingsRows.json();
  const [services, stats, projects, testimonials] = await Promise.all([
    get('services'),
    get('stats'),
    get('projects'),
    get('testimonials'),
  ]);
  const settings = Array.isArray(settingsList) ? settingsList[0] : null;
  if (!settings || !Array.isArray(services) || services.length === 0) {
    throw new Error('Supabase respondió sin settings o sin servicios');
  }
  return { settings, services, stats, projects, testimonials };
}

const originalSnapshot = await readFile(snapshotPath, 'utf8');
const originalLayout = await readFile(layoutPath, 'utf8');
if (!originalLayout.includes(REVALIDATE_NODE)) {
  throw new Error(`No encontré "${REVALIDATE_NODE}" en app/layout.tsx`);
}
let parked = false;
try {
  try {
    const published = await fetchPublished();
    if (published) {
      await writeFile(snapshotPath, JSON.stringify(published));
      console.log('Contenido de Supabase horneado en el export.');
    }
  } catch (err) {
    console.warn(`No se pudo leer Supabase (${err instanceof Error ? err.message : 'error'}). Se usa el contenido de respaldo.`);
    await writeFile(snapshotPath, '{}\n');
  }

  await writeFile(layoutPath, originalLayout.replace(REVALIDATE_NODE, REVALIDATE_STATIC));
  await parkApi();
  parked = true;
  await runNextBuild();
  console.log('Listo: ./out es una carpeta de assets estáticos (sin Worker script).');
} finally {
  if (parked) await restoreApi();
  await writeFile(snapshotPath, originalSnapshot);
  await writeFile(layoutPath, originalLayout);
}
