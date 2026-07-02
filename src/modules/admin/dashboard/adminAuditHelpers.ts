const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidEventGuid(value: string): boolean {
  return GUID_RE.test(value.trim());
}

export function auditEventRef(eventId: string): string {
  const compact = eventId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `WED-${compact}`;
}

export function auditEntryRef(entryId: string): string {
  const compact = entryId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `AUD-${compact}`;
}

export function formatAuditTimestamp(utc: string): string {
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return utc;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatEventDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function actionTypeCountsToTabs(
  counts: Record<string, number>
): Array<{ actionType: string; count: number }> {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([actionType, count]) => ({ actionType, count }));
}
