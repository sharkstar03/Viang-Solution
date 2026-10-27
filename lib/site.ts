/** Canonical public site. One constant so layout, robots, sitemap and JSON-LD agree. */
export const SITE_URL = 'https://viangsolutions.com';

/** Official visible name. Do not substitute older spellings. */
export const COMPANY_NAME = 'Viangsolutions & Services';

/** Public contact published in the seed. Used when env vars are absent. */
export const PUBLIC_PHONE = '+50767340816';
export const PUBLIC_WHATSAPP = '+50767340816';
export const PUBLIC_EMAIL = 'gerencia@viangsolutions.com';

const LEGACY_NAMES = [
  'ViangSolutions & Group S.A.',
  'Viang Solutions & Service',
  'Viang Solutions and Service',
  'Viang Solution',
];

/** Replace retired spellings. Longer variants run first so they are not partially rewritten. */
export function withOfficialName(text: string): string {
  let out = text;
  for (const legacy of LEGACY_NAMES) out = out.replaceAll(legacy, COMPANY_NAME);
  return out;
}
