import { Hero } from '@/components/sections/Hero';
import { ServiceLines } from '@/components/sections/ServiceLines';
import { WorkGallery } from '@/components/sections/WorkGallery';
import { Process } from '@/components/sections/Process';
import { WhyUs } from '@/components/sections/WhyUs';
import { TrustBar } from '@/components/sections/TrustBar';
import { ContactCta } from '@/components/sections/ContactCta';
import { getClients, getServices, getSettings } from '@/lib/content/queries';
import { homeBusinessJsonLd } from '@/lib/seo';

export default async function HomePage() {
  const [settings, services, clients] = await Promise.all([
    getSettings(), getServices(), getClients(),
  ]);
  const businessLd = homeBusinessJsonLd(settings);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }} />
      <Hero whatsapp={settings.whatsapp} />
      <ServiceLines />
      <WorkGallery />
      <Process />
      <WhyUs />
      <TrustBar clients={clients} />
      {/* Las cifras no se publican. El portafolio de la base sigue oculto si está vacío. */}
      <ContactCta services={services} hours={settings.business_hours} whatsapp={settings.whatsapp} />
    </main>
  );
}
