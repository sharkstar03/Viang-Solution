import remoteSnapshot from '@/lib/content/remote-snapshot.json';
import {
  fallbackClients, fallbackProjects, fallbackServices, fallbackSettings, fallbackStats, fallbackTestimonials,
} from '@/lib/content/fallback';
import { presentableStats } from '@/lib/content/stats';
import { withOfficialName } from '@/lib/site';
import { hasSupabasePublicEnv, supabaseServer } from '@/lib/supabase/server';
import type { Client, Project, Service, SiteSettings, Stat, Testimonial } from '@/lib/types';

/**
 * Lecturas del sitio público.
 * - Export estático: solo el snapshot horneado en el build, o el fallback.
 *   No hay fetch (un fetch sin caché impediría `output: 'export'`).
 * - Servidor Node: Supabase si las env públicas existen; si faltan o fallan,
 *   el mismo fallback, para que la página no se caiga.
 */

interface Snapshot {
  settings?: SiteSettings;
  services?: Service[];
  stats?: Stat[];
  clients?: Client[];
  projects?: Project[];
  testimonials?: Testimonial[];
}

function polishSettings(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    seo_title: withOfficialName(settings.seo_title),
    seo_description: withOfficialName(settings.seo_description),
  };
}

function fallbackBundle() {
  return {
    settings: polishSettings(fallbackSettings),
    services: fallbackServices,
    stats: presentableStats(fallbackStats),
    clients: fallbackClients,
    projects: fallbackProjects,
    testimonials: fallbackTestimonials,
  };
}

/** Contenido fijo del export. null en el build de Node, que sí puede consultar Supabase. */
function staticBundle() {
  if (process.env.STATIC_EXPORT !== '1') return null;
  const snap = remoteSnapshot as Snapshot;
  if (!snap.settings || !Array.isArray(snap.services) || snap.services.length === 0) {
    return fallbackBundle();
  }
  return {
    settings: polishSettings({ ...fallbackSettings, ...snap.settings }),
    services: snap.services,
    stats: presentableStats(snap.stats ?? []),
    clients: Array.isArray(snap.clients) && snap.clients.length > 0 ? snap.clients : fallbackClients,
    projects: snap.projects ?? [],
    testimonials: snap.testimonials ?? [],
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const bundled = staticBundle();
  if (bundled) return bundled.settings;
  if (!hasSupabasePublicEnv()) return fallbackBundle().settings;
  try {
    const { data, error } = await supabaseServer().from('site_settings').select('*').limit(1).maybeSingle();
    if (error || !data) return fallbackBundle().settings;
    return polishSettings(data as SiteSettings);
  } catch {
    console.error('content_unavailable:site_settings');
    return fallbackBundle().settings;
  }
}

export async function getServices(): Promise<Service[]> {
  const bundled = staticBundle();
  if (bundled) return bundled.services;
  if (!hasSupabasePublicEnv()) return fallbackBundle().services;
  try {
    const { data, error } = await supabaseServer().from('services').select('*').order('sort_order');
    if (error) return fallbackBundle().services;
    return (data ?? []) as Service[];
  } catch {
    console.error('content_unavailable:services');
    return fallbackBundle().services;
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getClients(): Promise<Client[]> {
  const bundled = staticBundle();
  if (bundled) return bundled.clients;
  if (!hasSupabasePublicEnv()) return fallbackClients;
  try {
    const { data, error } = await supabaseServer().from('clients').select('*').order('sort_order');
    if (error || !data?.length) return fallbackClients;
    return data as Client[];
  } catch {
    console.error('content_unavailable:clients');
    return fallbackClients;
  }
}

export async function getStats(): Promise<Stat[]> {
  const bundled = staticBundle();
  if (bundled) return bundled.stats;
  if (!hasSupabasePublicEnv()) return fallbackBundle().stats;
  try {
    const { data, error } = await supabaseServer().from('stats').select('*').order('sort_order');
    if (error) return fallbackBundle().stats;
    return presentableStats((data ?? []) as Stat[]);
  } catch {
    console.error('content_unavailable:stats');
    return fallbackBundle().stats;
  }
}

export async function getProjects(): Promise<Project[]> {
  const bundled = staticBundle();
  if (bundled) return bundled.projects;
  if (!hasSupabasePublicEnv()) return [];
  try {
    const { data, error } = await supabaseServer().from('projects').select('*').order('sort_order');
    if (error) return [];
    return (data ?? []) as Project[];
  } catch {
    console.error('content_unavailable:projects');
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const bundled = staticBundle();
  if (bundled) return bundled.testimonials;
  if (!hasSupabasePublicEnv()) return [];
  try {
    const { data, error } = await supabaseServer().from('testimonials').select('*').order('sort_order');
    if (error) return [];
    return (data ?? []) as Testimonial[];
  } catch {
    console.error('content_unavailable:testimonials');
    return [];
  }
}
