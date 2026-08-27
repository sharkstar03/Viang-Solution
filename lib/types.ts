/** Horarios por día; null = cerrado ese día. */
export type BusinessHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', { open: string; close: string } | null>
>;

export interface SiteSettings {
  id: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  business_hours: BusinessHours;
  social_links: Record<string, string>;
  seo_title: string;
  seo_description: string;
  og_image: string | null;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  icon: string;
  image_path: string | null;
  faq: { question: string; answer: string }[];
  price_from: number | null;
  sort_order: number;
}

export interface Client {
  id: string;
  name: string;
  logo_path: string;
  website_url: string | null;
  sort_order: number;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: string;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  service_id: string | null;
  description: string;
  image_before: string;
  image_after: string;
  completed_at: string | null;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  author_name: string;
  company: string;
  content: string;
  rating: number;
  avatar_path: string | null;
  sort_order: number;
}
