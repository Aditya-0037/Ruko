/** "+91 98765 43210" → "tel:+919876543210" (same format as the shared HelpSheet). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+0-9]/g, '')}`
}
