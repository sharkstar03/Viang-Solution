import Image from 'next/image';
import Link from 'next/link';
import { waLink } from '@/lib/whatsapp';
import type { Service, SiteSettings } from '@/lib/types';
import { COMPANY_NAME } from '@/lib/site';
import { LineIcon } from '@/components/ui/line-icons';

function prettyPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('507')) {
    return `(507) ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function Footer({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-deep pb-24 text-white/80 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Image src="/img/white-logo.png" alt={COMPANY_NAME} width={800} height={215} className="h-10 w-auto" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed">
            20 años en el mercado. Atención en todo Panamá. Aceptamos Visa y Mastercard.
          </p>
          <a href="https://instagram.com/viangsolution" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm tracking-wide text-accent">
            Instagram @viangsolution
          </a>
        </div>
        <nav aria-label="Servicios">
          <h3 className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.22em] text-white">Servicios</h3>
          <ul className="space-y-1 text-sm">
            {services.map((service) => (
              <li key={service.id}>
                <Link href={`/servicios/${service.slug}`} className="inline-flex min-h-11 items-center hover:text-white">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.22em] text-white">Contacto</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={waLink(settings.whatsapp, 'Hola, quiero cotizar un servicio')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 hover:text-white">
                <LineIcon name="chat" className="h-5 w-5 text-accent" />
                {prettyPhone(settings.phone)}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center gap-3 hover:text-white">
                <LineIcon name="mail" className="h-5 w-5 text-accent" />
                {settings.email}
              </a>
            </li>
            <li className="inline-flex min-h-11 items-center gap-3">
              <LineIcon name="card" className="h-5 w-5 text-accent" />
              Visa y Mastercard
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs sm:flex-row sm:justify-between">
          <p>© {year} {COMPANY_NAME}</p>
          <p>Ciudad de Panamá</p>
        </div>
      </div>
    </footer>
  );
}
