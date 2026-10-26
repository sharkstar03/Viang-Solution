import { WhatsAppIcon } from '@/components/ui/icons';
import { waLink } from '@/lib/whatsapp';

/** Acceso fijo a WhatsApp. El ícono va en verde con trazo oscuro, que sí contrasta. */
export function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={waLink(whatsapp, 'Hola, me gustaría cotizar un servicio')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-on-accent shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:bottom-5"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
