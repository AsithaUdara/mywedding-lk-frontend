export const VENDOR_PROPOSALS_UPDATED = "vendor-proposals-updated";

export function dispatchVendorProposalsUpdated(eventId?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(VENDOR_PROPOSALS_UPDATED, {
      detail: { eventId },
    })
  );
}
