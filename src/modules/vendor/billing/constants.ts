export type VendorTier = "Free" | "Featured" | "Sponsored";

export const VENDOR_TIER_PRICING: Record<VendorTier, number> = {
  Free: 0,
  Featured: 8500,
  Sponsored: 15000,
};

export const VENDOR_TIER_FEATURES: Record<VendorTier, string[]> = {
  Free: [
    "Standard vendor listing in search",
    "Profile, services, and inquiry inbox",
    "Basic analytics on dashboard",
    "Customer contact via platform",
  ],
  Featured: [
    "Everything in Free",
    "Boosted ranking in vendor & venue search",
    "Featured badge on your public profile",
    "Priority placement in category results",
    "Monthly performance insights email",
  ],
  Sponsored: [
    "Everything in Featured",
    "Top sponsored slots on homepage & search",
    "Sponsored badge for maximum trust",
    "Highest visibility for high-intent couples",
    "Dedicated growth tips from our team",
  ],
};
