import type { Project, Service, SiteSettings, Stat, Testimonial } from '@/lib/types';
import { COMPANY_NAME, PUBLIC_EMAIL, PUBLIC_PHONE, PUBLIC_WHATSAPP } from '@/lib/site';

/**
 * Contenido público cuando Supabase no está configurado o no responde.
 * Es el mismo texto que supabase/seed.sql (sin clientes y sin la cifra de años).
 * No agrega precios, reseñas ni nombres de clientes.
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

export const fallbackServices: Service[] = [
  {
    id: 'svc-pisos',
    slug: 'tratamientos-e-instalacion-de-pisos',
    title: 'Tratamientos e Instalación de Pisos',
    short_description:
      'Pulido y abrillantado de mármol, granito, porcelanato, concreto y más. Instalación, impermeabilización y epóxicos.',
    long_description:
      'Soluciones especializadas para todo tipo de superficies, adaptadas a sus necesidades y exigencias:\n- Pulido y abrillantado de mármol, granito, porcelanato, concreto, adoquines, cerámica, pasta, vinilo, PVC, piedras naturales, gongrani y terrazo\n- Instalación profesional de pisos\n- Tratamientos de impermeabilización y sellado contra humedad\n- Aplicación de recubrimientos de pintura epóxica de alta resistencia',
    icon: 'sparkles',
    image_path: 'img/stock/marble-corridor.jpg',
    faq: [],
    price_from: null,
    sort_order: 1,
  },
  {
    id: 'svc-limpieza',
    slug: 'limpieza-especializada',
    title: 'Limpieza Especializada',
    short_description:
      'Restauración de alfombras, muebles y tapicería automotriz, hidrolavado de precisión y limpieza integral.',
    long_description:
      'Trabajos de limpieza y restauración con estándares de calidad superiores, ideales para inmuebles residenciales de lujo, establecimientos comerciales y espacios corporativos:\n- Limpieza y restauración de alfombras residenciales y comerciales\n- Tratamientos para muebles de interiores y exteriores\n- Limpieza y restauración de tapicería automotriz\n- Limpieza y mantenimiento de cortinas y sistemas roller\n- Limpieza integral de espacios residenciales y comerciales\n- Limpieza de muros, techos y pisos mediante hidrolavado de precisión\n- Mantenimiento de áreas comunes en edificios y propiedades horizontales',
    icon: 'droplets',
    image_path: 'img/stock/sofa-cleaning.jpg',
    faq: [],
    price_from: null,
    sort_order: 2,
  },
  {
    id: 'svc-instalaciones',
    slug: 'instalaciones-y-reparaciones',
    title: 'Instalaciones y Reparaciones',
    short_description:
      'Equipos audiovisuales, electricidad menor, drywall, impermeabilización, pintura y mantenimiento de A/C.',
    long_description:
      'Instalación, mantenimiento y reparación para garantizar el correcto funcionamiento y la estética de sus espacios:\n- Instalación de equipos audiovisuales y elementos decorativos\n- Trabajos eléctricos de baja complejidad: luminarias, enchufes y sistemas de conexión\n- Estructuras y acabados en sistema drywall\n- Impermeabilización y tratamiento de techos y superficies expuestas\n- Pintura de interiores y exteriores con acabados de alta calidad\n- Mantenimiento preventivo y correctivo de sistemas de aire acondicionado',
    icon: 'wrench',
    image_path: 'img/stock/ac-service.jpg',
    faq: [],
    price_from: null,
    sort_order: 3,
  },
];

/** Cifras que ya estaban en el seed, excepto la de años, que se retiró. */
export const fallbackStats: Stat[] = [
  { id: 'stat-clients', label: 'Clientes satisfechos', value: 300, suffix: '+', icon: 'users', sort_order: 1 },
  { id: 'stat-projects', label: 'Proyectos realizados', value: 2670, suffix: '+', icon: 'briefcase', sort_order: 2 },
];

export const fallbackProjects: Project[] = [];
export const fallbackTestimonials: Testimonial[] = [];
