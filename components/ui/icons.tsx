/** Iconos SVG compartidos (inline: cero peticiones, tintados por currentColor). */

const base = { fill: 'currentColor', 'aria-hidden': true as const };

export function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.4Z" />
    </svg>
  );
}

export function MailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 7.5L4.5 6.7v10.6h15V6.7L12 11.5Zm0-2.2 7-4.3H5l7 4.3Z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1.1.4 2.3.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1.1.4-2.3.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.9-.2-2.3-.4a3.9 3.9 0 0 1-1.4-.9c-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1.1-.4-2.3-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1.1-.4 2.3-.4 1.3-.1 1.6-.1 4.8-.1Zm0 2c-3.1 0-3.5 0-4.7.1-1.1.1-1.5.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.6.7-.7 1.1-.1.4-.3.8-.4 1.9-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.5.4 1.9.2.5.4.8.7 1.1.3.3.7.6 1.1.7.4.1.8.3 1.9.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.5-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.6-.7.7-1.1.1-.4.3-.8.4-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.5-.4-1.9a2.8 2.8 0 0 0-.7-1.1 2.8 2.8 0 0 0-1.1-.7c-.4-.1-.8-.3-1.9-.4-1.2-.1-1.6-.1-4.7-.1Zm0 3.4a5.1 5.1 0 1 1 0 10.3 5.1 5.1 0 0 1 0-10.3Zm0 2a3.1 3.1 0 1 0 0 6.3 3.1 3.1 0 0 0 0-6.3Zm5.4-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
    </svg>
  );
}

export function TikTokIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M16.6 3c.4 2 1.7 3.4 3.8 3.6v2.9c-1.4 0-2.7-.4-3.9-1.2v5.9a5.9 5.9 0 1 1-5.9-5.9c.3 0 .7 0 1 .1v3a2.9 2.9 0 1 0 2 2.8V3h3Z" />
    </svg>
  );
}

export function LinkedInIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M20.4 3H3.6A.7.7 0 0 0 3 3.7v16.6c0 .4.3.7.6.7h16.8c.4 0 .6-.3.6-.7V3.7a.7.7 0 0 0-.6-.7ZM8.3 18.4H5.7V9.9h2.6v8.5ZM7 8.7a1.5 1.5 0 1 1 0-3.1 1.5 1.5 0 0 1 0 3.1Zm11.4 9.7h-2.6v-4.1c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.2h-2.6V9.9h2.5V11c.3-.7 1.2-1.4 2.5-1.4 2.6 0 3.1 1.7 3.1 4v4.8Z" />
    </svg>
  );
}

/** Iconos de servicios (mapeados por services.icon en la base). */
export function ServiceIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  switch (name) {
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <path d="M12 2l1.8 5.7L19.5 9l-5.7 1.8L12 16.5l-1.8-5.7L4.5 9l5.7-1.3L12 2Zm7 12 .9 2.6L22.5 18l-2.6.9L19 21.5l-.9-2.6-2.6-.9 2.6-1.4.9-2.6ZM5 14l.9 2.6 2.6.9-2.6.9L5 21l-.9-2.6L1.5 17.5l2.6-.9L5 14Z" />
        </svg>
      );
    case 'droplets':
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <path d="M12 3.2s5.5 6 5.5 10a5.5 5.5 0 1 1-11 0c0-4 5.5-10 5.5-10Z" />
        </svg>
      );
    case 'wrench':
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <path d="M21 6.8a5.5 5.5 0 0 1-7.4 6.5l-6.8 6.9a2 2 0 0 1-2.9-2.9l6.9-6.8A5.5 5.5 0 0 1 17.2 3l-3 3 .8 3 3-.8 3-2.4Z" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v3h16v-3c0-3.3-4.7-5-8-5Zm8.5-2.5a3.5 3.5 0 1 0-2.4-6 5.9 5.9 0 0 1 0 5.9c.7.1 1.6.1 2.4.1ZM19 13.3c1.8.9 4 2.3 4 4.7v3h-4v-3c0-1.9-.8-3.5-2-4.7h2Z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4Zm2 2h2V4h-2v2Zm-6 5h14V8H5v3Zm0 2v6h14v-6h-5v2h-4v-2H5Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} {...base}>
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}
