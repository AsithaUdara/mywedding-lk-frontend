/** Canonical vendor directory categories (matches home “Browse by category”). */
export const VENDOR_SEARCH_CATEGORIES = [
  "Photographers",
  "Venues",
  "Caterers",
  "Music",
  "Florists",
  "Videographers",
] as const;

export type VendorSearchCategory = (typeof VENDOR_SEARCH_CATEGORIES)[number];

export const VENDOR_SEARCH_PRICE_MIN = 50_000;
export const VENDOR_SEARCH_PRICE_MAX = 10_000_000;
export const VENDOR_SEARCH_PRICE_STEP = 250_000;

const CATEGORY_ALIASES: Record<VendorSearchCategory, readonly string[]> = {
  Photographers: ["photographers", "photography", "photographer"],
  Venues: ["venues", "venue"],
  Caterers: ["caterers", "catering", "caterer"],
  Music: ["music", "music bands", "band", "dj", "djs"],
  Florists: ["florists", "florist", "flowers"],
  Videographers: ["videographers", "videography", "videographer"],
};

const CATEGORY_SLUG_MAP: Record<string, VendorSearchCategory> = {
  photographers: "Photographers",
  photography: "Photographers",
  venues: "Venues",
  venue: "Venues",
  caterers: "Caterers",
  catering: "Caterers",
  music: "Music",
  florists: "Florists",
  florist: "Florists",
  videographers: "Videographers",
  videography: "Videographers",
};

export function resolveCategoryFromSearchParam(param: string): VendorSearchCategory | null {
  const normalized = param.trim().toLowerCase();
  if (CATEGORY_SLUG_MAP[normalized]) return CATEGORY_SLUG_MAP[normalized];

  return (
    VENDOR_SEARCH_CATEGORIES.find((category) => category.toLowerCase() === normalized) ?? null
  );
}

export function vendorMatchesCategory(
  vendorCategoryName: string,
  filterCategory: VendorSearchCategory
): boolean {
  const normalized = vendorCategoryName.trim().toLowerCase();
  if (!normalized) return false;

  const aliases = CATEGORY_ALIASES[filterCategory];
  return aliases.some(
    (alias) => normalized === alias || normalized.startsWith(`${alias} `) || normalized.includes(alias)
  );
}
