import Image from 'next/image';
import Link from 'next/link';
import { waLink } from '@/lib/whatsapp';
import {
  FacebookIcon, InstagramIcon, LinkedInIcon, MailIcon, TikTokIcon, WhatsAppIcon,
} from '@/components/ui/icons';
import type { Service, SiteSettings } from '@/lib/types';
import { COMPANY_NAME } from '@/lib/site';

const SOCIAL_ICONS: Record<string, { Icon: React.ComponentType<{ className?: string }>; label: string }> = {
  facebook: { Icon: FacebookIcon, label: 'Facebook' },
  instagram: { Icon: InstagramIcon, label: 'Instagram' },
  tiktok: { Icon: TikTokIcon, label: 'TikTok' },
  linkedin: { Icon: LinkedInIcon, label: 'LinkedIn' },
};

export function Footer({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const year = new Date().getFullYear();
  const socials = Object.entries(settings.social_links);

  return (
    <footer className="bg-white pb-24 text-ink md:pb-0">
      {/* Logo siempre sobre blanco: el triángulo azul se pierde en el azul de marca. */}
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Image
            src="/img/logo.png"
            alt={COMPANY_NAME}
            width={963}
            height={259}
            className="mx-auto h-10 w-auto sm:mx-0 md:h-12"
          />
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed sm:mx-0">
            Soluciones integrales para espacios residenciales y comerciales
            de alto valor en Panamá.
          </p>
          <div className="mt-6 flex justify-center gap-3 sm:justify-start">
            {socials.map(([name, url]) => {
              const social = SOCIAL_ICONS[name];
              if (!social) return null;
              return (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white"
                >
                  <social.Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Servicios">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
            Servicios
          </h3>
          <ul className="space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/servicios/${s.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-primary"
                >
                  <span aria-hidden className="text-accent">›</span>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
            Contáctanos
          </h3>
          <ul className="space-y-3.5 text-sm">
            <li>
              <a
                href={waLink(settings.whatsapp, 'Hola, me gustaría más información')}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-3 transition-colors hover:text-primary"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp transition-colors group-hover:bg-whatsapp group-hover:text-on-accent">
                  <WhatsAppIcon />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{settings.phone.replace('+507', '(507) ')}</span>
                  <span className="text-xs text-ink/70">Respuesta rápida por WhatsApp</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="group inline-flex min-h-11 items-center gap-3 transition-colors hover:text-primary"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <MailIcon />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{settings.email}</span>
                  <span className="text-xs text-ink/70">Escríbanos cuando quiera</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Pie ─────────────────────────────────────────────── */}
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink/70 sm:flex-row">
          <p>© {year} {COMPANY_NAME}. Todos los derechos reservados.</p>
          <p>Panamá 🇵🇦</p>
        </div>
      </div>
    </footer>
  );
}
