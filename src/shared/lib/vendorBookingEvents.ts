export const VENDOR_BOOKINGS_UPDATED = "vendor-bookings-updated";

export function dispatchVendorBookingsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VENDOR_BOOKINGS_UPDATED));
}
