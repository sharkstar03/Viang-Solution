import nodemailer from 'nodemailer';
import type { ContactInput } from '@/lib/validation/contact';

/** Escapa HTML para prevenir inyección en el cuerpo del email. */
function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Notifica un lead por email. Lanza si falla — el llamador decide qué
 * hacer (el lead ya debe estar guardado en la base antes de llamar esto).
 */
export async function sendLeadNotification(lead: Omit<ContactInput, 'turnstileToken'>): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_RECIPIENT ?? 'viangsolutions@yahoo.es',
    cc: process.env.EMAIL_USER,
    replyTo: lead.email,
    subject: `Nuevo Contacto Web: ${lead.service}`,
    html: `
      <h2>Nuevo mensaje de contacto desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(lead.phone)}</p>
      <p><strong>Servicio:</strong> ${escapeHtml(lead.service)}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(lead.message)}</p>
    `,
  });
}
