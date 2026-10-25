import type { Client, Project, SiteSettings, Stat, Testimonial } from '@/lib/types';
import { servicesFromLines } from '@/lib/content/service-lines';
import { COMPANY_NAME, PUBLIC_EMAIL, PUBLIC_PHONE, PUBLIC_WHATSAPP } from '@/lib/site';

/**
 * Contenido público cuando Supabase no está configurado o no responde.
 * Mismos textos que supabase/seed.sql. Las cifras no se publican.
 * Los nueve logos están aprobados por el dueño (01.png … 09.png).
 */
const hours = {
  mon: { open: '08:00', close: '17:00' },
  tue: { open: '08:00', close: '17:00' },
  wed: { open: '08:00', close: '17:00' },
  thu: { open: '08:00', close: '17:00' },
  fri: { open: '08:00', close: '17:00' },
  sat: null,
  sun: null,
} as const;

export const fallbackSettings: SiteSettings = {
  id: 'fallback-settings',
  phone: PUBLIC_PHONE,
  whatsapp: PUBLIC_WHATSAPP,
  email: PUBLIC_EMAIL,
  address: 'Ciudad de Panamá, Panamá',
  business_hours: hours,
  social_links: {
    facebook: 'https://www.facebook.com/viangsolutions',
    instagram: 'https://instagram.com/viangsolution',
    tiktok: 'https://www.tiktok.com/@viangsolution',
    linkedin: 'https://www.linkedin.com/in/vionel-angulo-cede%C3%B1o/',
  },
  seo_title: `${COMPANY_NAME} — Limpieza y Mantenimiento Especializado en Panamá`,
  seo_description:
    'Soluciones integrales para espacios residenciales y comerciales de alto valor: tratamientos de pisos, limpieza especializada, instalaciones y reparaciones en Panamá.',
  og_image: null,
};

/** Mismos textos y fotos que lib/content/service-lines.ts. Sin stock. */
export const fallbackServices = servicesFromLines();

/** No publicar cifras: no están confirmadas. */
export const fallbackStats: Stat[] = [];

/** Orden = public/img/clientes/01.png … 09.png. Nombres aprobados como texto alternativo. */
export const fallbackClients: Client[] = [
  { id: 'client-01', name: 'Tocumen Aeropuerto Internacional', logo_path: 'img/clientes/01.png', website_url: null, sort_order: 1 },
  { id: 'client-02', name: 'Cervecería Barú (Grupo Heineken)', logo_path: 'img/clientes/02.png', website_url: null, sort_order: 2 },
  { id: 'client-03', name: 'Hotel El Panamá', logo_path: 'img/clientes/03.png', website_url: null, sort_order: 3 },
  { id: 'client-04', name: 'Massimo Dutti', logo_path: 'img/clientes/04.png', website_url: null, sort_order: 4 },
  { id: 'client-05', name: 'Nike', logo_path: 'img/clientes/05.png', website_url: null, sort_order: 5 },
  { id: 'client-06', name: 'Regency Real Estate', logo_path: 'img/clientes/06.png', website_url: null, sort_order: 6 },
  { id: 'client-07', name: 'Puma', logo_path: 'img/clientes/07.png', website_url: null, sort_order: 7 },
  { id: 'client-08', name: 'Sportline America', logo_path: 'img/clientes/08.png', website_url: null, sort_order: 8 },
  { id: 'client-09', name: 'Desigual', logo_path: 'img/clientes/09.png', website_url: null, sort_order: 9 },
];

export const fallbackProjects: Project[] = [];
export const fallbackTestimonials: Testimonial[] = [];
