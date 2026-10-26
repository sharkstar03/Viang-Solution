import { WhatsAppIcon } from '@/components/ui/icons';
import { waLink } from '@/lib/whatsapp';

/** Barra inferior solo en el teléfono: cotizar y llamar, con zona de pulgar. */
export function MobileDock({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  return (
    <nav
      aria-label="Acciones rápidas"
      className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-ink/10 bg-white px-3 pt-2 shadow-soft md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={waLink(whatsapp, 'Hola, me gustaría cotizar un servicio')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp px-3 text-sm font-semibold text-on-accent active:scale-[0.98]"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Cotizar por WhatsApp
      </a>
      <a
        href={`tel:${phone}`}
        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-primary px-3 text-sm font-semibold text-white active:scale-[0.98]"
      >
        Llamar
      </a>
    </nav>
  );
}
