import { waLink } from '@/lib/whatsapp';

/**
 * Barra fija inferior, solo móvil: el visitante nunca está a más de un
 * toque de contactarnos. Áreas táctiles ≥ 44px (min-h-11).
 */
export function MobileActionBar({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const items = [
    {
      href: waLink(whatsapp, 'Hola, me gustaría cotizar un servicio'),
      label: 'WhatsApp',
      external: true,
      cls: 'bg-whatsapp text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.4Z" />
        </svg>
      ),
    },
    {
      href: `tel:${phone}`,
      label: 'Llamar',
      external: false,
      cls: 'bg-primary text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
        </svg>
      ),
    },
    {
      href: '/#cotizar',
      label: 'Cotizar',
      external: false,
      cls: 'bg-accent text-ink',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-7 14H7v-2h5v2Zm5-4H7v-2h10v2Zm0-4H7V7h10v2Z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Acciones rápidas"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-px border-t border-black/5 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          aria-label={it.label}
          {...(it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`m-1.5 flex min-h-11 items-center justify-center gap-1.5 rounded-full text-sm font-semibold ${it.cls}`}
        >
          {it.icon}
          {it.label}
        </a>
      ))}
    </nav>
  );
}
