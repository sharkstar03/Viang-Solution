import Image from 'next/image';
import { waLink } from '@/lib/whatsapp';
import type { SiteSettings } from '@/lib/types';

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const socials = Object.entries(settings.social_links);

  return (
    <footer className="bg-ink pb-24 text-white/80 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <Image src="/img/white-logo.png" alt="Viang Solution" width={150} height={47} />
          <p className="mt-4 text-sm leading-relaxed">
            Limpieza y mantenimiento profesional para hogares y empresas en Panamá.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Contáctanos</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${settings.phone}`} className="transition-colors hover:text-white">
                {settings.phone.replace('+507', '(507) ')}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-white">
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={waLink(settings.whatsapp, 'Hola, me gustaría más información')}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                WhatsApp
              </a>
            </li>
            <li>{settings.address}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Síguenos</h3>
          <ul className="space-y-2 text-sm capitalize">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © {year} VIANG SOLUTION. Todos los derechos reservados.
      </div>
    </footer>
  );
}
