import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Stats } from '@/components/sections/Stats';
import { Portfolio } from '@/components/sections/Portfolio';
import { Testimonials } from '@/components/sections/Testimonials';
import { ContactCta } from '@/components/sections/ContactCta';
import { getProjects, getServices, getSettings, getStats, getTestimonials } from '@/lib/content/queries';
import { homeBusinessJsonLd } from '@/lib/seo';

export default async function HomePage() {
  const [settings, services, stats, projects, testimonials] = await Promise.all([
    getSettings(), getServices(), getStats(), getProjects(), getTestimonials(),
  ]);
  const businessLd = homeBusinessJsonLd(settings);

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }} />
      <Hero whatsapp={settings.whatsapp} />
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
