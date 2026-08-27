import { supabaseServer } from '@/lib/supabase/server';
import type { Client, Project, Service, SiteSettings, Stat, Testimonial } from '@/lib/types';

/**
 * Todas las lecturas de contenido del sitio público.
 * La caché vive a nivel de página (ISR con `revalidate`); el panel de la
 * Fase 2 invalidará con revalidatePath al guardar.
 */

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseServer().from('site_settings').select('*').limit(1).single();
  if (error) throw new Error(`No se pudo leer site_settings: ${error.message}`);
  return data as SiteSettings;
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabaseServer()
    .from('services').select('*').order('sort_order');
  if (error) throw new Error(`No se pudo leer services: ${error.message}`);
  return (data ?? []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabaseServer()
    .from('services').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`No se pudo leer service ${slug}: ${error.message}`);
  return (data as Service) ?? null;
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabaseServer()
    .from('clients').select('*').order('sort_order');
  if (error) throw new Error(`No se pudo leer clients: ${error.message}`);
  return (data ?? []) as Client[];
}

export async function getStats(): Promise<Stat[]> {
  const { data, error } = await supabaseServer().from('stats').select('*').order('sort_order');
  if (error) throw new Error(`No se pudo leer stats: ${error.message}`);
  return (data ?? []) as Stat[];
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabaseServer()
    .from('projects').select('*').order('sort_order');
  if (error) throw new Error(`No se pudo leer projects: ${error.message}`);
  return (data ?? []) as Project[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabaseServer()
    .from('testimonials').select('*').order('sort_order');
  if (error) throw new Error(`No se pudo leer testimonials: ${error.message}`);
  return (data ?? []) as Testimonial[];
}
