import type { Service, SiteSettings } from '@/lib/types';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';

type JsonLd = Record<string, unknown>;

/** Home page: LocalBusiness and its HomeAndConstructionBusiness subtype. No ratings or prices. */
export function homeBusinessJsonLd(s: SiteSettings): JsonLd {
  return {
    ...localBusinessJsonLd(s),
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    description: s.seo_description,
    image: `${SITE_URL}/img/logo.png`,
    areaServed: 'Panamá',
  };
}

export function localBusinessJsonLd(s: SiteSettings): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY_NAME,
    url: SITE_URL,
    telephone: s.phone,
    email: s.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ciudad de Panamá',
      addressCountry: 'PA',
    },
    sameAs: Object.values(s.social_links),
  };
}

export function serviceJsonLd(service: Service, s: SiteSettings): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.short_description,
    url: `${SITE_URL}/servicios/${service.slug}`,
    areaServed: 'Panamá',
    provider: localBusinessJsonLd(s),
  };
}

/** null con lista vacía: no se emite un FAQPage sin preguntas. */
export function faqJsonLd(faq: { question: string; answer: string }[]): JsonLd | null {
  if (faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
