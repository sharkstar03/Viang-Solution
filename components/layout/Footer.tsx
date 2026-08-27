import Image from 'next/image';
import { waLink } from '@/lib/whatsapp';
import {
  FacebookIcon, InstagramIcon, LinkedInIcon, MailIcon, TikTokIcon, WhatsAppIcon,
} from '@/components/ui/icons';
import type { SiteSettings } from '@/lib/types';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
};

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const socials = Object.entries(settings.social_links);

  return (
    <footer className="bg-ink pb-24 text-white/80 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <Image src="/img/white-logo.png" alt="Viang Solution" width={180} height={57} className="h-12 w-auto" />
          <p className="mt-4 text-sm leading-relaxed">
            Soluciones integrales para espacios residenciales y comerciales de alto valor en Panamá.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Contáctanos</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={waLink(settings.whatsapp, 'Hola, me gustaría más información')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                {settings.phone.replace('+507', '(507) ')}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <MailIcon className="h-5 w-5 text-primary-light" />
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Síguenos</h3>
          <ul className="space-y-3 text-sm">
            {socials.map(([name, url]) => {
              const Icon = SOCIAL_ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 capitalize transition-colors hover:text-white"
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © {year} VIANG SOLUTIONS & SERVICE. Todos los derechos reservados.
      </div>
    </footer>
  );
}
