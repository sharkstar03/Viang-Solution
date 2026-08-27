import type { Metadata } from 'next';
import { ContactCta } from '@/components/sections/ContactCta';
import { getServices, getSettings } from '@/lib/content/queries';

export const metadata: Metadata = {
  title: 'Cotizar',
  description: 'Solicite una cotización sin compromiso para su hogar o empresa en Panamá.',
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <main className="bg-surface pt-24">
      <ContactCta services={services} hours={settings.business_hours} whatsapp={settings.whatsapp} />
    </main>
  );
}
