import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServices, getSettings } from '@/lib/content/queries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileActionBar } from '@/components/layout/MobileActionBar';
import './globals.css';

// next/font descarga Inter en build y la sirve desde el propio dominio:
// cero peticiones a CDNs en runtime.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

// ISR: el layout (y las páginas debajo) se regeneran cada 5 minutos;
// el panel de la Fase 2 invalidará al guardar.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seo_title, template: `%s · Viang Solution` },
    description: s.seo_description,
    metadataBase: new URL('https://viangsolution.com'),
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
    <html lang="es" className={inter.variable}>
      <body className="bg-white font-sans text-ink antialiased">
        <Header phone={settings.phone} />
        {children}
        <Footer settings={settings} services={services} />
        <MobileActionBar phone={settings.phone} whatsapp={settings.whatsapp} />
      </body>
    </html>
  );
}
