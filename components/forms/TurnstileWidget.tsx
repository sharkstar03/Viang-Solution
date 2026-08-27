'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => void;
    };
  }
}

/**
 * Widget oficial de Cloudflare Turnstile. El script se inyecta recién
 * cuando este componente se monta (paso 3): cero peso en la carga inicial.
 * Sin dummy-token, sin bypass: el token real viene del callback.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || rendered.current) return;

    const renderWidget = () => {
      if (rendered.current || !window.turnstile) return;
      rendered.current = true;
      window.turnstile.render(el, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
        callback: onToken,
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileReady';
    script.async = true;
    (window as unknown as Record<string, unknown>).__turnstileReady = renderWidget;
    document.head.appendChild(script);
  }, [onToken]);

  return <div ref={ref} className="min-h-[65px]" />;
}
