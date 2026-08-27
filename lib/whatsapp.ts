/** Enlace wa.me: solo dígitos en el número, mensaje URL-encoded. */
export function waLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
