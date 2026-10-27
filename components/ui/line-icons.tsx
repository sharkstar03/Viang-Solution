/** Trazo único, 1.4px. Servicios, proceso y contacto. */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

const paths: Record<string, React.ReactNode> = {
  floor: (
    <>
      <path d="M4 16.5 12 20l8-3.5" />
      <path d="M4 12.5 12 16l8-3.5L12 9 4 12.5Z" />
      <path d="M12 4v5" />
    </>
  ),
  clean: (
    <>
      <path d="M5 19c2.2-4 4-7 7-11 3 4 4.8 7 7 11" />
      <path d="M8 19h8" />
      <path d="M12 4v2" />
    </>
  ),
  install: (
    <>
      <path d="M14.5 5.5 18.5 9.5" />
      <path d="M8 20 4 16l8.5-8.5 4 4L8 20Z" />
      <path d="M13 7.5 16.5 4" />
    </>
  ),
  visit: (
    <>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="1.6" />
    </>
  ),
  quote: (
    <>
      <path d="M7 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H11l-4 3v-3H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </>
  ),
  work: (
    <>
      <path d="M4 18V8h16v10" />
      <path d="M9 8V5h6v3" />
      <path d="M4 13h16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.2 7 9 4.2-1.8 7-4.8 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5L15 15" />
    </>
  ),
  phone: (
    <>
      <path d="M8 4h2.5l1.2 3.2-1.8 1a12 12 0 0 0 5.9 5.9l1-1.8 3.2 1.2V16a2 2 0 0 1-2 2A14 14 0 0 1 4 6a2 2 0 0 1 2-2Z" />
    </>
  ),
  chat: (
    <>
      <path d="M5 16.5 4 20l3.6-1.2A8 8 0 1 0 5 16.5Z" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M3 10h18" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  pin: (
    <>
      <circle cx="12" cy="11" r="2.2" />
      <path d="M12 21s6-5 6-10a6 6 0 1 0-12 0c0 5 6 10 6 10Z" />
    </>
  ),
};

export function LineIcon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      {paths[name] ?? paths.floor}
    </svg>
  );
}
