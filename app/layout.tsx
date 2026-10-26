import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { getServices, getSettings } from '@/lib/content/queries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { MobileDock } from '@/components/layout/MobileDock';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

// next/font descarga Inter en build y la sirve desde el propio dominio:
// cero peticiones a CDNs en runtime.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap', weight: ['600', '700'] });

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
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="bg-primary font-sans text-white antialiased">
        <Header />
        {children}
        <Footer settings={settings} services={services} />
        <WhatsAppFloat whatsapp={settings.whatsapp} />
        <MobileDock phone={settings.phone} whatsapp={settings.whatsapp} />
      </body>
    </html>
  );
}
