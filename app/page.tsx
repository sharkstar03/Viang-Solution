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
      <Hero whatsapp={settings.whatsapp} hours={settings.business_hours} />
      <TrustBar clients={clients} />
      <Services services={services} />
      <About />
      {/* Las tres siguientes se ocultan solas mientras estén vacías */}
      <Stats stats={stats} />
      <Portfolio projects={projects} />
      <Testimonials testimonials={testimonials} />
      <ContactCta services={services} hours={settings.business_hours} />
    </main>
  );
}
