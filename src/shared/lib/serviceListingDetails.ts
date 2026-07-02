export interface ServiceListingDetails {
  includedItems: string[];
  highlights: string[];
  durationLabel?: string;
  capacityNote?: string;
  cancellationPolicy?: string;
}

export const DEFAULT_INCLUDED_SUGGESTIONS = [
  "Initial consultation",
  "On-site coordination",
  "Setup and breakdown",
  "Travel within Colombo",
  "Backup equipment / staff",
];

export const DEFAULT_HIGHLIGHT_SUGGESTIONS = [
  "Award-winning team",
  "Flexible packages",
  "Same-day preview",
  "Dedicated coordinator",
  "Trusted by 100+ couples",
];

export function parseListingDetails(json?: string | null): ServiceListingDetails {
  if (!json) {
    return { includedItems: [], highlights: [] };
  }
  try {
    const data = JSON.parse(json) as Partial<ServiceListingDetails>;
    return {
      includedItems: Array.isArray(data.includedItems) ? data.includedItems.filter(Boolean) : [],
      highlights: Array.isArray(data.highlights) ? data.highlights.filter(Boolean) : [],
      durationLabel: data.durationLabel ?? undefined,
      capacityNote: data.capacityNote ?? undefined,
      cancellationPolicy: data.cancellationPolicy ?? undefined,
    };
  } catch {
    return { includedItems: [], highlights: [] };
  }
}

export function serializeListingDetails(details: ServiceListingDetails): string | undefined {
  const payload: ServiceListingDetails = {
    includedItems: details.includedItems.filter((item) => item.trim()),
    highlights: details.highlights.filter((item) => item.trim()),
    durationLabel: details.durationLabel?.trim() || undefined,
    capacityNote: details.capacityNote?.trim() || undefined,
    cancellationPolicy: details.cancellationPolicy?.trim() || undefined,
  };

  const hasContent =
    payload.includedItems.length > 0 ||
    payload.highlights.length > 0 ||
    payload.durationLabel ||
    payload.capacityNote ||
    payload.cancellationPolicy;

  return hasContent ? JSON.stringify(payload) : undefined;
}
