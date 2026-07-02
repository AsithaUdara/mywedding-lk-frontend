/** Strip formatting for tel: links (keeps leading + for country code). */
export function phoneTelHref(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return `tel:${trimmed.replace(/[^\d+]/g, "")}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("94")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+94${digits.slice(1)}`;
  return `tel:+94${digits}`;
}

export function formatDisplayPhone(phone: string): string {
  return phone.trim();
}
