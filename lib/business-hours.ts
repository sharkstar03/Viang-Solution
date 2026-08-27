import type { BusinessHours } from '@/lib/types';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_NAMES: Record<string, string> = {
  sun: 'domingo', mon: 'lunes', tue: 'martes', wed: 'miércoles',
  thu: 'jueves', fri: 'viernes', sat: 'sábado',
};

/** Convierte un instante a { día, "HH:MM" } en una zona horaria. */
function localParts(now: Date, tz: string): { day: (typeof DAY_KEYS)[number]; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('weekday').toLowerCase().slice(0, 3) as (typeof DAY_KEYS)[number];
  // Intl puede devolver "24" para medianoche
  const hour = get('hour') === '24' ? '00' : get('hour');
  return { day, time: `${hour}:${get('minute')}` };
}

/**
 * ¿Está abierto el negocio ahora? `nextChange` describe el próximo cambio
 * en texto listo para UI ("mañana a las 08:00").
 */
export function isOpenNow(
  hours: BusinessHours,
  now: Date,
  tz = 'America/Panama',
): { open: boolean; nextChange: string } {
  const { day, time } = localParts(now, tz);
  const today = hours[day];

  if (today && time >= today.open && time < today.close) {
    return { open: true, nextChange: `hoy hasta las ${today.close}` };
  }

  // Cerrado: buscar la próxima apertura (hoy más tarde, o días siguientes)
  if (today && time < today.open) {
    return { open: false, nextChange: `hoy a las ${today.open}` };
  }
  const startIdx = DAY_KEYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_KEYS[(startIdx + i) % 7];
    const d = hours[key];
    if (d) {
      const when = i === 1 ? 'mañana' : `el ${DAY_NAMES[key]}`;
      return { open: false, nextChange: `${when} a las ${d.open}` };
    }
  }
  return { open: false, nextChange: '' };
}
