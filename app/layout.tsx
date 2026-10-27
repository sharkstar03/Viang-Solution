import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import { getServices, getSettings } from '@/lib/content/queries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { MobileDock } from '@/components/layout/MobileDock';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

// next/font descarga las fuentes en build y las sirve desde el propio dominio.
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK'],
});

// ISR en el servidor Node. El build de Cloudflare reescribe esta línea a
// `false` (un ternario no es una config de segmento válida para el export).
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seo_title, template: `%s · ${COMPANY_NAME}` },
    description: s.seo_description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: s.seo_title,
      description: s.seo_description,
      locale: 'es_PA',
      type: 'website',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);

  return (
    <html lang="es" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="bg-marble font-sans text-ink antialiased">
        <Header />
        {children}
        <Footer settings={settings} services={services} />
        <WhatsAppFloat whatsapp={settings.whatsapp} />
        <MobileDock phone={settings.phone} whatsapp={settings.whatsapp} />
      </body>
    </html>
  );
}
