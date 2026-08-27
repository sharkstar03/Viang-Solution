'use client';

import { useEffect } from 'react';
import { QuoteForm } from '@/components/forms/QuoteForm';
import type { BusinessHours, Service } from '@/lib/types';

/** QuoteForm con el servicio de la página ya preseleccionado en el borrador. */
export function QuoteFormPreset({ services, preset, settings }: {
  services: Service[];
  preset: string;
  settings: { hours: BusinessHours; whatsapp: string };
}) {
  useEffect(() => {
    try {
      const key = 'viang-quote-draft';
      const draft = JSON.parse(sessionStorage.getItem(key) ?? '{}');
      if (!draft.service) {
        sessionStorage.setItem(key, JSON.stringify({ ...draft, service: preset }));
      }
    } catch {
      /* sin almacenamiento: el usuario selecciona a mano */
    }
  }, [preset]);

  return <QuoteForm services={services} hours={settings.hours} whatsapp={settings.whatsapp} />;
}
