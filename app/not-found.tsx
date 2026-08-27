import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { waLink } from '@/lib/whatsapp';

/** 404 que no pierde ventas: siempre ofrece contacto directo. */
export default function NotFound() {
  const whatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? '';
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '';
  return (
    <main className="flex min-h-[70svh] flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="text-6xl font-bold text-primary-light">404</p>
      <h1 className="mt-3 text-2xl font-bold">Esta página no existe</h1>
      <p className="mt-2 max-w-md text-ink/60">
        Pero nosotros sí. Vuelva al inicio o escríbanos directamente.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button asChild><Link href="/">Ir al inicio</Link></Button>
        {whatsapp && (
          <Button variant="whatsapp" asChild>
            <a href={waLink(whatsapp, 'Hola, me gustaría más información')} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        )}
        {phone && (
          <Button variant="secondary" asChild>
            <a href={`tel:${phone}`}>Llamar</a>
          </Button>
        )}
      </div>
    </main>
  );
}
