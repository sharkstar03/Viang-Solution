'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ServiceIcon, WhatsAppIcon } from '@/components/ui/icons';
import { TurnstileWidget } from '@/components/forms/TurnstileWidget';
import { isOpenNow } from '@/lib/business-hours';
import { waLink } from '@/lib/whatsapp';
import type { BusinessHours, Service } from '@/lib/types';

const DRAFT_KEY = 'viang-quote-draft';

interface Draft {
  service: string;
  message: string;
  name: string;
  email: string;
  phone: string;
}

const empty: Draft = { service: '', message: '', name: '', email: '', phone: '' };

function loadDraft(): Draft {
  try {
    return { ...empty, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') };
  } catch {
    return empty;
  }
}

/**
 * Cotización en 3 pasos: servicio → mensaje → datos + Turnstile.
 * El borrador vive en sessionStorage: una recarga o un fallo de red
 * jamás pierden lo escrito.
 */
export function QuoteForm({ services, hours, whatsapp = '' }: {
  services: Service[];
  hours: BusinessHours;
  whatsapp?: string;
}) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(empty);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [stepError, setStepError] = useState('');

  // Restaura el borrador SOLO tras hidratar: sessionStorage no existe en el
  // servidor y leerlo durante el render provocaría un desajuste SSR/cliente.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(loadDraft()), []);

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* almacenamiento lleno o bloqueado: seguimos en memoria */
      }
      return next;
    });
  };

  const onToken = useCallback((t: string) => setToken(t), []);

  const next = () => {
    setStepError('');
    if (step === 1 && !draft.service) {
      setStepError('Seleccione un servicio para continuar');
      return;
    }
    if (step === 2 && draft.message.trim().length < 10) {
      setStepError('Cuéntenos un poco más (mínimo 10 caracteres)');
      return;
    }
    setStep(step + 1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.email.trim() || !draft.phone.trim()) {
      setStepError('Complete nombre, correo y teléfono');
      return;
    }
    setStepError('');
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, turnstileToken: token }),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (data.ok) {
        sessionStorage.removeItem(DRAFT_KEY);
        setStatus('done');
      } else {
        setErrorMsg(data.error ?? '');
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    const { open } = isOpenNow(hours, new Date());
    return (
      <div role="status" className="rounded-card bg-white p-8 text-center shadow-soft">
        <p className="text-4xl" aria-hidden>✅</p>
        <h3 className="mt-3 text-xl font-bold">¡Recibimos su solicitud!</h3>
        <p className="mt-2 text-ink/60">
          {open
            ? 'Estamos abiertos: le respondemos en los próximos minutos.'
            : 'Le respondemos apenas abramos.'}
        </p>
      </div>
    );
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-ink/15 px-4 py-3 text-base outline-none transition-colors focus:border-primary-light';

  return (
    <form onSubmit={submit} className="rounded-card bg-white p-6 shadow-soft md:p-8" noValidate>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={`Paso ${step} de 3`}
        className="mb-6"
      >
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-primary-light' : 'bg-ink/10'}`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-ink/40">
          <span className={step >= 1 ? 'text-primary-light' : ''}>Servicio</span>
          <span className={step >= 2 ? 'text-primary-light' : ''}>Detalles</span>
          <span className={step >= 3 ? 'text-primary-light' : ''}>Contacto</span>
        </div>
      </div>

      {step === 1 && (
        <fieldset>
          <legend className="text-lg font-bold">¿Qué servicio necesita?</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ service: s.title })}
                aria-pressed={draft.service === s.title}
                className={`flex min-h-11 items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
                  draft.service === s.title
                    ? 'border-primary-light bg-primary-light/5 text-primary shadow-soft'
                    : 'border-ink/10 hover:border-primary-light/50'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  draft.service === s.title ? 'bg-primary-light text-white' : 'bg-surface text-primary-light'
                }`}>
                  <ServiceIcon name={s.icon} />
                </span>
                {s.title}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <div>
          <label htmlFor="qf-message" className="text-lg font-bold">
            Cuéntenos qué necesita <span className="sr-only">(mensaje)</span>
          </label>
          <textarea
            id="qf-message"
            aria-label="Mensaje"
            rows={5}
            value={draft.message}
            onChange={(e) => update({ message: e.target.value })}
            placeholder="Ej.: pulir 80 m² de piso de mármol en una residencia en Costa del Este…"
            className={inputCls}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-lg font-bold">Sus datos de contacto</p>
          <div>
            <label htmlFor="qf-name" className="text-sm font-medium">Nombre</label>
            <input id="qf-name" autoComplete="name" value={draft.name}
              onChange={(e) => update({ name: e.target.value })} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qf-email" className="text-sm font-medium">Correo</label>
              <input id="qf-email" type="email" autoComplete="email" value={draft.email}
                onChange={(e) => update({ email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label htmlFor="qf-phone" className="text-sm font-medium">Teléfono</label>
              <input id="qf-phone" type="tel" autoComplete="tel" value={draft.phone}
                onChange={(e) => update({ phone: e.target.value })} className={inputCls} />
            </div>
          </div>
          <TurnstileWidget onToken={onToken} />
        </div>
      )}

      {stepError && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">{stepError}</p>
      )}

      {status === 'error' && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-700">
            No pudimos enviar su solicitud. Su mensaje está guardado — intente de nuevo
            {whatsapp && ' o escríbanos directo:'}
          </p>
          {errorMsg && <p className="mt-1 text-red-600">{errorMsg}</p>}
          {whatsapp && (
            <a
              href={waLink(whatsapp, `Hola, quiero cotizar ${draft.service}. ${draft.message}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-5 py-2 font-semibold text-white"
            >
              <WhatsAppIcon />
              Continuar por WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button type="button" onClick={() => setStep(step - 1)}
            className="min-h-11 rounded-full px-5 font-semibold text-ink/60 hover:text-ink">
            Atrás
          </button>
        ) : <span />}
        {step < 3 ? (
          // key distinta: evita que React reutilice este <button> como el de
          // enviar y el clic de "Continuar" dispare un submit accidental.
          <Button key="next" type="button" onClick={next}>Continuar</Button>
        ) : (
          <Button key="submit" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
          </Button>
        )}
      </div>
    </form>
  );
}
