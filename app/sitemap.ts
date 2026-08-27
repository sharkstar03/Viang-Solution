import type { MetadataRoute } from 'next';
import { getServices } from '@/lib/content/queries';

const SITE_URL = 'https://viangsolution.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.8 },
    ...services.map((s) => ({
      url: `${SITE_URL}/servicios/${s.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  ];
}
