import { waLink } from '@/lib/whatsapp';

export function MobileDock({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  return (
    <nav
      aria-label="Acciones rápidas"
      className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-white/10 bg-primary-deep px-3 pt-2 md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={waLink(whatsapp, 'Hola, quiero cotizar un servicio')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 flex-1 items-center justify-center bg-white px-3 text-sm font-medium text-ink active:scale-[0.98]"
      >
        Cotice sin compromiso
      </a>
      <a
        href={`tel:${phone}`}
        className="inline-flex min-h-11 items-center justify-center border border-white/30 px-5 text-sm text-white"
      >
        Llamar
      </a>
    </nav>
  );
}
