import { describe, it, expect } from 'vitest';
import { serviceJsonLd, localBusinessJsonLd, faqJsonLd, homeBusinessJsonLd } from '@/lib/seo';
import type { Service, SiteSettings } from '@/lib/types';

const settings: SiteSettings = {
  id: '1', phone: '+50767340816', whatsapp: '+50767340816',
  email: 'viangsolutions@yahoo.es', address: 'Ciudad de Panamá, Panamá',
  business_hours: {}, social_links: { facebook: 'https://fb.com/x' },
  seo_title: 'Viang', seo_description: 'desc', og_image: null,
};
const service: Service = {
  id: '2', slug: 'limpieza-especializada', title: 'Limpieza Especializada',
  short_description: 'Restauración de alfombras y más.', long_description: '',
  icon: '', image_path: 'img/Servicios/alfombras.jpg',
  faq: [
    { question: '¿Atienden residencias?', answer: 'Sí, y también comercios.' },
    { question: '¿Usan productos seguros?', answer: 'Sí, de primera calidad.' },
  ],
  price_from: null, sort_order: 2,
};

describe('JSON-LD', () => {
  it('serviceJsonLd produce Service con provider LocalBusiness', () => {
    const ld = serviceJsonLd(service, settings);
    expect(ld['@type']).toBe('Service');
    expect((ld.provider as { '@type': string })['@type']).toBe('LocalBusiness');
  });

  it('localBusinessJsonLd incluye teléfono y redes', () => {
    const ld = localBusinessJsonLd(settings);
    expect(ld.telephone).toBe('+50767340816');
    expect(ld.sameAs).toEqual(['https://fb.com/x']);
    expect(ld.name).toBe('Viangsolutions & Services');
    expect(ld.url).toBe('https://viangsolutions.com');
  });

  it('homeBusinessJsonLd declara el tipo de obra y no inventa precios ni reseñas', () => {
    const ld = homeBusinessJsonLd(settings);
    expect(ld['@type']).toEqual(['LocalBusiness', 'HomeAndConstructionBusiness']);
    expect(ld.name).toBe('Viangsolutions & Services');
    expect(ld).not.toHaveProperty('aggregateRating');
    expect(ld).not.toHaveProperty('priceRange');
    expect(ld).not.toHaveProperty('review');
  });

  it('faqJsonLd con 2 preguntas produce FAQPage con 2 mainEntity', () => {
    const ld = faqJsonLd(service.faq)!;
    expect(ld['@type']).toBe('FAQPage');
    expect((ld.mainEntity as unknown[]).length).toBe(2);
  });

  it('faqJsonLd con [] devuelve null (no se emite script vacío)', () => {
    expect(faqJsonLd([])).toBeNull();
  });
});
