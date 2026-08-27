import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { waLink } from '@/lib/whatsapp';
import {
  FacebookIcon, InstagramIcon, LinkedInIcon, MailIcon, TikTokIcon, WhatsAppIcon,
} from '@/components/ui/icons';
import type { Service, SiteSettings } from '@/lib/types';

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
    <footer className="bg-ink pb-24 text-white/70 md:pb-0">
      {/* ── Banda de conversión ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-2xl font-bold text-white md:text-3xl">
              ¿Listo para transformar su espacio?
            </p>
            <p className="mt-1.5 text-white/80">
              Cotización sin compromiso, respuesta rápida.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button variant="whatsapp" size="lg" asChild>
              <a
                href={waLink(settings.whatsapp, 'Hola, quiero transformar mi espacio')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="/#cotizar">Cotizar ahora</a>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Cuerpo ──────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Image src="/img/white-logo.png" alt="Viang Solution" width={190} height={60} className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Soluciones integrales para espacios residenciales y comerciales
            de alto valor en Panamá.
          </p>
          <div className="mt-6 flex gap-3">
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
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:text-white"
                >
                  <social.Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Servicios">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Servicios
          </h3>
          <ul className="space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/servicios/${s.slug}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <span aria-hidden className="text-accent">›</span>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Contáctanos
          </h3>
          <ul className="space-y-3.5 text-sm">
            <li>
              <a
                href={waLink(settings.whatsapp, 'Hola, me gustaría más información')}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 transition-colors hover:text-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp transition-colors group-hover:bg-whatsapp group-hover:text-white">
                  <WhatsAppIcon />
                </span>
                <span>
                  <span className="block font-semibold text-white">{settings.phone.replace('+507', '(507) ')}</span>
                  <span className="text-xs text-white/50">Respuesta rápida por WhatsApp</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="group inline-flex items-center gap-3 transition-colors hover:text-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light/20 text-primary-light transition-colors group-hover:bg-primary-light group-hover:text-white">
                  <MailIcon />
                </span>
                <span>
                  <span className="block font-semibold text-white">{settings.email}</span>
                  <span className="text-xs text-white/50">Escríbanos cuando quiera</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Pie ─────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {year} ViangSolutions &amp; Group S.A. Todos los derechos reservados.</p>
          <p>Panamá 🇵🇦</p>
        </div>
      </div>
    </footer>
  );
}
