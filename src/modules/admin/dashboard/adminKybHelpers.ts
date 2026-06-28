import type { PendingVendor } from "@/shared/lib/api/admin";

export type KybQueueStats = {
  pending: number;
  incomplete: number;
  readyToReview: number;
  categories: number;
};

export type KybReviewFlag = {
  id: string;
  label: string;
};

export function kybVendorRef(userId: string): string {
  const compact = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `VND-${compact}`;
}

export function kybReviewFlags(vendor: PendingVendor): KybReviewFlag[] {
  const flags: KybReviewFlag[] = [];
  if (!vendor.businessDescription?.trim()) {
    flags.push({ id: "description", label: "No business description" });
  }
  if (!vendor.categoryName?.trim()) {
    flags.push({ id: "category", label: "No category" });
  }
  if (!vendor.city?.trim()) {
    flags.push({ id: "city", label: "No location" });
  }
  if (!vendor.ownerEmail?.trim()) {
    flags.push({ id: "email", label: "No contact email" });
  }
  return flags;
}

export function isKybProfileComplete(vendor: PendingVendor): boolean {
  return kybReviewFlags(vendor).length === 0;
}

export function kybQueueStats(vendors: PendingVendor[]): KybQueueStats {
  const incomplete = vendors.filter((v) => !isKybProfileComplete(v)).length;
  return {
    pending: vendors.length,
    incomplete,
    readyToReview: vendors.length - incomplete,
    categories: new Set(vendors.map((v) => v.categoryName).filter(Boolean)).size,
  };
}

export function filterKybVendors(vendors: PendingVendor[], query: string): PendingVendor[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return vendors;

  return vendors.filter((vendor) => {
    const haystack = [
      vendor.businessName,
      vendor.ownerName,
      vendor.ownerEmail,
      vendor.city,
      vendor.categoryName,
      kybVendorRef(vendor.userId),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
