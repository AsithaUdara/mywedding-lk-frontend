export function payoutBookingRef(bookingId: string): string {
  const compact = bookingId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `BKG-${compact}`;
}

export function payoutEventRef(eventId: string): string {
  const compact = eventId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `WED-${compact}`;
}

export function payoutSettlementRef(settlementId: string): string {
  const compact = settlementId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `STL-${compact}`;
}

export function formatPayoutCreatedDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
