import { describe, it, expect } from 'vitest';
import { isOpenNow } from '@/lib/business-hours';
import type { BusinessHours } from '@/lib/types';

const hours: BusinessHours = {
  mon: { open: '08:00', close: '17:00' },
  tue: { open: '08:00', close: '17:00' },
  wed: { open: '08:00', close: '17:00' },
  thu: { open: '08:00', close: '17:00' },
  fri: { open: '08:00', close: '17:00' },
  sat: null,
  sun: null,
};

// Panamá es UTC-5 sin horario de verano: 15:00 UTC = 10:00 local.
const tueMorning = new Date('2026-08-25T15:00:00Z'); // martes 10:00 en Panamá
const tueEvening = new Date('2026-08-25T23:00:00Z'); // martes 18:00 en Panamá
const sunday = new Date('2026-08-30T15:00:00Z');     // domingo 10:00 en Panamá

describe('isOpenNow', () => {
  it('martes 10:00 → abierto', () => {
    expect(isOpenNow(hours, tueMorning).open).toBe(true);
  });

  it('martes 18:00 → cerrado, próxima apertura miércoles 08:00', () => {
    const r = isOpenNow(hours, tueEvening);
    expect(r.open).toBe(false);
    expect(r.nextChange).toContain('08:00');
  });

  it('domingo (null) → cerrado', () => {
    expect(isOpenNow(hours, sunday).open).toBe(false);
  });

  it('horarios vacíos → cerrado sin lanzar', () => {
    expect(isOpenNow({}, tueMorning).open).toBe(false);
  });
});
