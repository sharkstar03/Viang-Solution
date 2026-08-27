import { Hero } from '@/components/sections/Hero';
import { TrustBar } from '@/components/sections/TrustBar';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Stats } from '@/components/sections/Stats';
import { Portfolio } from '@/components/sections/Portfolio';
import { Testimonials } from '@/components/sections/Testimonials';
import { ContactCta } from '@/components/sections/ContactCta';
import {
  getClients, getProjects, getServices, getSettings, getStats, getTestimonials,
} from '@/lib/content/queries';

export default async function HomePage() {
  const [settings, services, clients, stats, projects, testimonials] = await Promise.all([
    getSettings(), getServices(), getClients(), getStats(), getProjects(), getTestimonials(),
  ]);

  return (
    <main>
      <Hero whatsapp={settings.whatsapp} />
      <TrustBar clients={clients} />
      <Services services={services} />
      {/* Stats, Portfolio y Testimonials se ocultan solos mientras estén vacíos */}
      <Stats stats={stats} />
      <About />
      <Portfolio projects={projects} />
      <Testimonials testimonials={testimonials} />
      <ContactCta services={services} hours={settings.business_hours} whatsapp={settings.whatsapp} />
    </main>
  );
}
